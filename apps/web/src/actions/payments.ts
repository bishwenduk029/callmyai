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
