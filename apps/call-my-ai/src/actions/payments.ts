/* eslint-disable @typescript-eslint/no-non-null-assertion -- checked in configureLemonSqueezy() */
"use server"

import crypto from "node:crypto"

import { revalidatePath } from "next/cache"
import {
  cancelSubscription,
  createCheckout,
  createWebhook,
  getPrice,
  getProduct,
  getSubscription,
  listPrices,
  listProducts,
  listWebhooks,
  updateSubscription,
  type Variant,
} from "@lemonsqueezy/lemonsqueezy.js"
import { eq } from "drizzle-orm"

import { db } from "@/config/db"
import { configureLemonSqueezy } from "@/config/lemonsqueezy"
import {
  plans,
  subscriptions,
  webhookEvents,
  type NewPlan,
  type NewSubscription,
  type NewWebhookEvent,
} from "@/db/schema"

import { webhookHasData, webhookHasMeta } from "@/lib/typeguards"
import { takeUniqueOrThrow } from "@/lib/utils"

import { auth, signOut } from "../auth"
import { getUserByEmail } from "./user"

/**
 * This action will log out the current user.
 */
export async function logout() {
  await signOut()
}

/**
 * This action will create a checkout on Lemon Squeezy.
 */
export async function getCheckoutURL(variantId: number, embed = false) {
  configureLemonSqueezy()

  const session = await auth()

  if (!session?.user?.email) {
    throw new Error("User is not authenticated or email is missing.")
  }

  const user = await getUserByEmail({ email: session.user.email })

  if (!user) {
    throw new Error("User not found.")
  }

  const checkout = await createCheckout(
    process.env.LEMONSQUEEZY_STORE_ID!,
    variantId,
    {
      checkoutOptions: {
        embed,
        media: !embed,
        logo: !embed,
      },
      checkoutData: {
        email: session.user.email,
        custom: {
          user_id: user.id,
        },
      },
      productOptions: {
        enabledVariants: [variantId],
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/`,
        receiptButtonText: "Go To CallMyAi",
        receiptThankYouNote: "Thank you!",
      },
    }
  )

  return checkout.data?.data.attributes.url
}

/**
 * This action will sync the product variants from Lemon Squeezy with the
 * Plans database model. It will only sync the 'subscription' variants.
 */
export async function syncPlans() {
  configureLemonSqueezy()

  // Fetch all the variants from the database.
  const productVariants: NewPlan[] = await db.select().from(plans)

  // Helper function to add a variant to the productVariants array and sync it with the database.
  async function _addVariant(variant: NewPlan) {
    // eslint-disable-next-line no-console -- allow
    console.log(`Syncing variant ${variant.name} with the database...`)

    // Sync the variant with the plan in the database.
    await db
      .insert(plans)
      .values(variant)
      .onConflictDoUpdate({ target: plans.variantId, set: variant })

    /* eslint-disable no-console -- allow */
    console.log(`${variant.name} synced with the database...`)

    productVariants.push(variant)
  }

  // Fetch products from the Lemon Squeezy store.
  const products = await listProducts({
    filter: { storeId: process.env.LEMONSQUEEZY_STORE_ID },
    include: ["variants"],
  })

  // Loop through all the variants.
  const allVariants = products.data?.included as Variant["data"][] | undefined

  // for...of supports asynchronous operations, unlike forEach.
  if (allVariants) {
    for (const v of allVariants) {
      const variant = v.attributes

      // Skip draft variants or if there's more than one variant, skip the default
      // variant. See https://docs.lemonsqueezy.com/api/variants
      if (
        variant.status === "draft" ||
        (allVariants.length !== 1 && variant.status === "pending")
      ) {
        // `return` exits the function entirely, not just the current iteration.
        continue
      }

      // Fetch the Product name.
      const productName =
        (await getProduct(variant.product_id)).data?.data.attributes.name ?? ""

      // Fetch the Price object.
      const variantPriceObject = await listPrices({
        filter: {
          variantId: v.id,
        },
      })

      const currentPriceObj = variantPriceObject.data?.data.at(0)
      const isUsageBased =
        currentPriceObj?.attributes.usage_aggregation !== null
      const interval = currentPriceObj?.attributes.renewal_interval_unit
      const intervalCount =
        currentPriceObj?.attributes.renewal_interval_quantity
      const trialInterval = currentPriceObj?.attributes.trial_interval_unit
      const trialIntervalCount =
        currentPriceObj?.attributes.trial_interval_quantity

      const price = isUsageBased
        ? currentPriceObj?.attributes.unit_price_decimal
        : currentPriceObj.attributes.unit_price

      const priceString = price !== null ? price?.toString() ?? "" : ""

      const isSubscription =
        currentPriceObj?.attributes.category === "subscription"

      // If not a subscription, skip it.
      if (!isSubscription) {
        continue
      }

      await _addVariant({
        name: variant.name,
        description: variant.description,
        price: priceString,
        interval,
        intervalCount,
        isUsageBased,
        productId: variant.product_id,
        productName,
        variantId: parseInt(v.id) as unknown as number,
        trialInterval,
        trialIntervalCount,
        sort: variant.sort,
      })
    }
  }

  return productVariants
}

/**
 * This action will store a webhook event in the database.
 * @param eventName - The name of the event.
 * @param body - The body of the event.
 */
export async function storeWebhookEvent(
  eventName: string,
  body: NewWebhookEvent["body"]
) {

  const id = crypto.randomInt(100000000, 1000000000)

  const returnedValue = await db
    .insert(webhookEvents)
    .values({
      id,
      eventName,
      processed: false,
      body,
    })
    .onConflictDoNothing({ target: plans.id })
    .returning()

  return returnedValue[0]
}

/**
 * This action will process a webhook event in the database.
 */
export async function processWebhookEvent(webhookEvent: NewWebhookEvent) {
  configureLemonSqueezy()

  console.log("Processing webhook event:", webhookEvent.id)

  const dbwebhookEvent = await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.id, webhookEvent.id))

  if (dbwebhookEvent.length < 1) {
    console.log("Webhook event not found in database:", webhookEvent.id)
    throw new Error(
      `Webhook event #${webhookEvent.id} not found in the database.`
    )
  }

  let processingError = ""
  const eventBody = webhookEvent.body

  if (!webhookHasMeta(eventBody)) {
    console.log("Event body is missing 'meta' property:", webhookEvent.id)
    processingError = "Event body is missing the 'meta' property."
  } else if (webhookHasData(eventBody)) {
    console.log("Event has data, processing:", webhookEvent.eventName)
    if (webhookEvent.eventName.startsWith("subscription_payment_")) {
      console.log("Subscription payment event:", webhookEvent.id)
      // Save subscription invoices; eventBody is a SubscriptionInvoice
      // Not implemented.
    } else if (webhookEvent.eventName.startsWith("subscription_")) {
      console.log("Subscription event:", webhookEvent.id)
      // Save subscription events; obj is a Subscription
      const attributes = eventBody.data.attributes
      const variantId = attributes.variant_id as string

      // We assume that the Plan table is up to date.
      const plan = await db
        .select()
        .from(plans)
        .where(eq(plans.variantId, parseInt(variantId, 10)))

      if (plan.length < 1) {
        console.log("Plan not found for variantId:", variantId)
        processingError = `Plan with variantId ${variantId} not found.`
      } else {
        console.log("Updating subscription in database:", eventBody.data.id)
        // Update the subscription in the database.

        const priceId = attributes.first_subscription_item.price_id

        // Get the price data from Lemon Squeezy.
        const priceData = await getPrice(priceId)
        if (priceData.error) {
          console.log("Failed to get price data:", priceId)
          processingError = `Failed to get the price data for the subscription ${eventBody.data.id}.`
        }

        const isUsageBased = attributes.first_subscription_item.is_usage_based
        const price = isUsageBased
          ? priceData.data?.data.attributes.unit_price_decimal
          : priceData.data?.data.attributes.unit_price

        const updateData: NewSubscription = {
          lemonSqueezyId: eventBody.data.id,
          orderId: attributes.order_id as number,
          name: attributes.user_name as string,
          email: attributes.user_email as string,
          status: attributes.status as string,
          statusFormatted: attributes.status_formatted as string,
          renewsAt: attributes.renews_at as string,
          endsAt: attributes.ends_at as string,
          trialEndsAt: attributes.trial_ends_at as string,
          price: price?.toString() ?? "",
          isPaused: false,
          subscriptionItemId: attributes.first_subscription_item.id,
          isUsageBased: attributes.first_subscription_item.is_usage_based,
          userId: eventBody.meta.custom_data.user_id,
          planId: plan[0]?.id || 1,
        }

        // Create/update subscription in the database.
        try {
          await db.insert(subscriptions).values(updateData).onConflictDoUpdate({
            target: subscriptions.lemonSqueezyId,
            set: updateData,
          })
          console.log("Successfully upserted subscription:", updateData.lemonSqueezyId)
        } catch (error) {
          console.error("Failed to upsert subscription:", error)
          processingError = `Failed to upsert Subscription #${updateData.lemonSqueezyId} to the database.`
        }
      }
    } else if (webhookEvent.eventName.startsWith("order_")) {
      console.log("Order event:", webhookEvent.id)
      // Save orders; eventBody is a "Order"
      /* Not implemented */
    } else if (webhookEvent.eventName.startsWith("license_")) {
      console.log("License event:", webhookEvent.id)
      // Save license keys; eventBody is a "License key"
      /* Not implemented */
    }

    // Update the webhook event in the database.
    await db
      .update(webhookEvents)
      .set({
        processed: true,
        processingError,
      })
      .where(eq(webhookEvents.id, webhookEvent.id))
    console.log("Updated webhook event status:", webhookEvent.id, "Error:", processingError || "None")
  } else {
    console.log("Event does not have data:", webhookEvent.id)
  }
}

/**
 * This action will get the subscriptions for the current user.
 */
export async function getUserSubscriptions() {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error("User is not authenticated or email is missing.")
  }

  const user = await getUserByEmail({ email: session.user.email })

  if (!user) {
    throw new Error("User not found.")
  }

  const userSubscriptions: NewSubscription[] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))

  return userSubscriptions
}

/**
 * This action will get the subscription URLs (update_payment_method and
 * customer_portal) for the given subscription ID.
 *
 */
export async function getSubscriptionURLs(id: string) {
  configureLemonSqueezy()
  const subscription = await getSubscription(id)

  if (subscription.error) {
    throw new Error(subscription.error.message)
  }

  return subscription.data?.data.attributes.urls
}

/**
 * This action will cancel a subscription on Lemon Squeezy.
 */
export async function cancelSub(id: string) {
  configureLemonSqueezy()

  // Get user subscriptions
  const userSubscriptions = await getUserSubscriptions()

  // Check if the subscription exists
  const subscription = userSubscriptions.find(
    (sub) => sub.lemonSqueezyId === id
  )

  if (!subscription) {
    throw new Error(`Subscription #${id} not found.`)
  }

  const cancelledSub = await cancelSubscription(id)

  if (cancelledSub.error) {
    throw new Error(cancelledSub.error.message)
  }

  // Update the db
  try {
    await db
      .update(subscriptions)
      .set({
        status: cancelledSub.data?.data.attributes.status,
        statusFormatted: cancelledSub.data?.data.attributes.status_formatted,
        endsAt: cancelledSub.data?.data.attributes.ends_at,
      })
      .where(eq(subscriptions.lemonSqueezyId, id))
  } catch (error) {
    throw new Error(`Failed to cancel Subscription #${id} in the database.`)
  }

  revalidatePath("/")

  return cancelledSub
}

/**
 * This action will pause a subscription on Lemon Squeezy.
 */
export async function pauseUserSubscription(id: string) {
  configureLemonSqueezy()

  // Get user subscriptions
  const userSubscriptions = await getUserSubscriptions()

  // Check if the subscription exists
  const subscription = userSubscriptions.find(
    (sub) => sub.lemonSqueezyId === id
  )

  if (!subscription) {
    throw new Error(`Subscription #${id} not found.`)
  }

  const returnedSub = await updateSubscription(id, {
    pause: {
      mode: "void",
    },
  })

  // Update the db
  try {
    await db
      .update(subscriptions)
      .set({
        status: returnedSub.data?.data.attributes.status,
        statusFormatted: returnedSub.data?.data.attributes.status_formatted,
        endsAt: returnedSub.data?.data.attributes.ends_at,
        isPaused: returnedSub.data?.data.attributes.pause !== null,
      })
      .where(eq(subscriptions.lemonSqueezyId, id))
  } catch (error) {
    throw new Error(`Failed to pause Subscription #${id} in the database.`)
  }

  revalidatePath("/")

  return returnedSub
}

/**
 * This action will unpause a subscription on Lemon Squeezy.
 */
export async function unpauseUserSubscription(id: string) {
  configureLemonSqueezy()

  // Get user subscriptions
  const userSubscriptions = await getUserSubscriptions()

  // Check if the subscription exists
  const subscription = userSubscriptions.find(
    (sub) => sub.lemonSqueezyId === id
  )

  if (!subscription) {
    throw new Error(`Subscription #${id} not found.`)
  }

  const returnedSub = await updateSubscription(id, {
    // @ts-ignore -- null is a valid value for pause
    pause: null,
  })

  // Update the db
  try {
    await db
      .update(subscriptions)
      .set({
        status: returnedSub.data?.data.attributes.status,
        statusFormatted: returnedSub.data?.data.attributes.status_formatted,
        endsAt: returnedSub.data?.data.attributes.ends_at,
        isPaused: returnedSub.data?.data.attributes.pause !== null,
      })
      .where(eq(subscriptions.lemonSqueezyId, id))
  } catch (error) {
    throw new Error(`Failed to pause Subscription #${id} in the database.`)
  }

  revalidatePath("/")

  return returnedSub
}

/**
 * This action will change the plan of a subscription on Lemon Squeezy.
 */
export async function changePlan(currentPlanId: number, newPlanId: number) {
  configureLemonSqueezy()

  // Get user subscriptions
  const userSubscriptions = await getUserSubscriptions()

  // Check if the subscription exists
  const subscription = userSubscriptions.find(
    (sub) => sub.planId === currentPlanId
  )

  if (!subscription) {
    throw new Error(`No subscription with plan id #${currentPlanId} was found.`)
  }

  // Get the new plan details from the database.
  const newPlan = await db
    .select()
    .from(plans)
    .where(eq(plans.id, newPlanId))
    .then(takeUniqueOrThrow)

  // Send request to Lemon Squeezy to change the subscription.
  const updatedSub = await updateSubscription(subscription.lemonSqueezyId, {
    variantId: newPlan.variantId,
  })

  // Save in db
  try {
    await db
      .update(subscriptions)
      .set({
        planId: newPlanId,
        price: newPlan.price,
        endsAt: updatedSub.data?.data.attributes.ends_at,
      })
      .where(eq(subscriptions.lemonSqueezyId, subscription.lemonSqueezyId))
  } catch (error) {
    throw new Error(
      `Failed to update Subscription #${subscription.lemonSqueezyId} in the database.`
    )
  }

  revalidatePath("/")

  return updatedSub
}
