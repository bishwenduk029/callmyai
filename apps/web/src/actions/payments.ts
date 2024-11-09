/* eslint-disable @typescript-eslint/no-non-null-assertion -- checked in configureLemonSqueezy() */
"use server"

import crypto from "node:crypto"

import {
  createCheckout,
  getPrice,
  getProduct,
  getSubscription,
  listPrices,
  listProducts,
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
          user_id: user.data?.id,
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
 * This action will get the subscriptions for the current user.
 */
export async function getUserSubscriptions(userId: string) {
  const userSubscriptions = await db
    .select({
      subscription: subscriptions,
      variantId: plans.variantId,
    })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(eq(subscriptions.userId, userId))

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
