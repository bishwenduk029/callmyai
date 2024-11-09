import { headers } from "next/headers"
import {
  WebhookSubscriptionActivePayload,
  WebhookSubscriptionCanceledPayload,
  WebhookSubscriptionCreatedPayload,
  WebhookSubscriptionRevokedPayload,
  WebhookSubscriptionUpdatedPayload,
} from "@polar-sh/sdk/models/components"
import { eq } from "drizzle-orm"
import { Webhook } from "standardwebhooks"

import { db } from "@/config/db"
import { subscriptions, users, webhookEvents } from "@/db/schema"
import { pricingPlans } from "@/data/pricing-plans"

type WebhookEvent =
  | WebhookSubscriptionCreatedPayload
  | WebhookSubscriptionActivePayload
  | WebhookSubscriptionCanceledPayload
  | WebhookSubscriptionUpdatedPayload
  | WebhookSubscriptionRevokedPayload

export async function POST(request: Request) {
  try {
    console.log('🎯 Webhook received - Starting processing')
    const requestBody = await request.text()
    const headersList = headers()

    console.log('📨 Webhook headers:', {
      id: headersList.get("webhook-id"),
      timestamp: headersList.get("webhook-timestamp"),
      // Don't log the full signature for security
      hasSignature: !!headersList.get("webhook-signature")
    })

    const webhookHeaders = {
      "webhook-id": headersList.get("webhook-id") ?? "",
      "webhook-timestamp": headersList.get("webhook-timestamp") ?? "",
      "webhook-signature": headersList.get("webhook-signature") ?? "",
    }

    if (!process.env.POLAR_WEBHOOK_SECRET) {
      console.error('❌ POLAR_WEBHOOK_SECRET not configured')
      return Response.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      )
    }

    const webhookSecret = Buffer.from(
      process.env.POLAR_WEBHOOK_SECRET
    ).toString("base64")
    const wh = new Webhook(webhookSecret)

    console.log('🔍 Verifying webhook signature...')
    const webhookPayload = wh.verify(
      requestBody,
      webhookHeaders
    ) as WebhookEvent

    console.log('✅ Webhook verified. Event type:', webhookPayload.type)
    console.log('📦 Webhook payload:', JSON.stringify(webhookPayload, null, 2))

    // Store webhook event
    await db.insert(webhookEvents).values({
      eventName: webhookPayload.type!,
      body: webhookPayload,
      processed: false,
    })
    console.log('📝 Webhook event stored in database')

    const { data } = webhookPayload
    if (!data) {
      console.error('❌ Invalid webhook payload - no data field')
      return Response.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      )
    }

    switch (webhookPayload.type) {
      case "subscription.created":
      case "subscription.active": {
        const plan = pricingPlans.find((p) => p.polarPriceId === data.priceId)
        if (!plan) {
          console.error('❌ Invalid price ID:', data.priceId)
          return Response.json({ error: "Invalid price ID" }, { status: 400 })
        }
        console.log('💰 Processing subscription event for plan:', plan.id)

        const existingSub = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.email, data.user.email))
          .limit(1)

        if (existingSub.length > 0) {
          await db
            .update(subscriptions)
            .set({
              status: data.status === "active" ? "ACTIVE" : "CANCELLED",
              planId: Number(plan.id),
              statusFormatted: data.status,
              renewsAt: data.currentPeriodEnd?.toISOString() ?? null,
              isPaused: false,
            })
            .where(eq(subscriptions.email, data.user.email))
        } else {
          const [user] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, data.user.email))
            .limit(1)

          if (!user)
            return Response.json({ error: "User not found" }, { status: 404 })
          await db.insert(subscriptions).values({
            userId: user.id,
            orderId: parseInt(data.id),
            name: data.user.publicName || "Unknown",
            email: data.user.email,
            status: data.status === "active" ? "ACTIVE" : "CANCELLED",
            statusFormatted: data.status,
            planId: Number(plan.id),
            price: data.price.toString(),
            renewsAt: data.currentPeriodEnd?.toISOString() ?? null,
            isUsageBased: false,
            isPaused: false,
          })
        }
        console.log('✅ Subscription processed successfully')
        break
      }

      case "subscription.canceled":
      case "subscription.revoked": {
        console.log('🚫 Processing cancellation for email:', data.user.email)
        await db
          .update(subscriptions)
          .set({
            status: "CANCELLED",
            statusFormatted: "CANCELLED",
            renewsAt: null,
            isPaused: true,
          })
          .where(eq(subscriptions.email, data.user.email))
        console.log('✅ Subscription cancellation processed')
        break
      }

      default:
        console.error('❌ Unhandled webhook event type:', webhookPayload.type)
        return Response.json(
          { error: "Unhandled webhook event" },
          { status: 400 }
        )
    }

    // Mark webhook event as processed
    await db
      .update(webhookEvents)
      .set({ processed: true })
      .where(eq(webhookEvents.eventName, webhookPayload.type))
    console.log('✅ Webhook event marked as processed')

    return Response.json({ received: true })
  } catch (error) {
    console.error('🔥 Webhook error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    })

    // Store failed webhook event if possible
    if (error instanceof Error) {
      try {
        await db.insert(webhookEvents).values({
          eventName: "error",
          body: { error: error.message },
          processed: false,
          processingError: error.message,
        })
        console.log('📝 Error event stored in database')
      } catch (dbError) {
        console.error('❌ Failed to store error event:', dbError)
      }
    }

    return Response.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    )
  }
}
