import {
  Environment,
  EventEntity,
  EventName,
  LogLevel,
  Paddle,
  PaddleOptions,
  SubscriptionCreatedEvent,
  SubscriptionUpdatedEvent,
} from "@paddle/paddle-node-sdk"
import { eq } from "drizzle-orm"

import { db } from "@/config/db"
import { subscriptions, users } from "@/db/schema"

export function getPaddleInstance() {
  const paddleOptions: PaddleOptions = {
    environment:
      (process.env.NEXT_PUBLIC_PADDLE_ENV as Environment) ??
      Environment.sandbox,
    logLevel: LogLevel.verbose,
  }

  if (!process.env.PADDLE_API_KEY) {
    console.error("Paddle API key is missing")
  }

  return new Paddle(process.env.PADDLE_API_KEY!, paddleOptions)
}

interface ProcessSubscriptionParams {
  paddleCustomerId: string
  status: string
  id: string
  publicName?: string
  currentPeriodEnd?: string
  priceId: string
  price: string
  allowedDuration?: number
  allowedApps?: number
  allowedFiles?: number
  allowedCalls?: number
  allowedAssistants?: number
}

interface PaddleCustomerResponse {
  data: {
    id: string
    name: string | null
    email: string
    status: string
    marketing_consent: boolean
    custom_data: Record<string, any> | null
    created_at: string
    updated_at: string
  }
}

export class ProcessWebhook {
  async processEvent(eventData: EventEntity) {
    switch (eventData.eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated:
        await this.updateSubscriptionData(eventData)
        break
      case EventName.SubscriptionCanceled:
        await this.cancelSubscription(eventData)
        break
    }
  }

  private async updateSubscriptionData(
    eventData: SubscriptionCreatedEvent | SubscriptionUpdatedEvent
  ) {
    try {
      const subscriptionData = this.extractSubscriptionData(eventData)
      await this.processSubscription(subscriptionData)
    } catch (error) {
      console.error("Failed to update subscription:", error)
      throw error
    }
  }

  private async cancelSubscription(eventData: any) {
    try {
      const email = eventData.data?.user?.email
      if (!email) throw new Error("No email found in cancellation event")

      await db
        .update(subscriptions)
        .set({
          status: "CANCELLED",
          statusFormatted: "CANCELLED",
          renewsAt: null,
          isPaused: true,
        })
        .where(eq(subscriptions.email, email))
    } catch (error) {
      console.error("Failed to cancel subscription:", error)
      throw error
    }
  }

  private async processSubscription({
    paddleCustomerId,
    status,
    id,
    publicName,
    currentPeriodEnd,
    priceId,
    price,
    allowedDuration,
    allowedApps,
    allowedFiles,
    allowedCalls,
    allowedAssistants,
  }: ProcessSubscriptionParams) {
    const customerData = await this.fetchPaddleCustomer(paddleCustomerId);
    const email = customerData.data.email;

    const existingSub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.email, email))
      .limit(1);

    if (existingSub.length > 0) {
      await this.updateExistingSubscription({
        id,
        price,
        priceId,
        paddleCustomerId,
        status,
        currentPeriodEnd,
        allowedDuration,
        allowedApps,
        allowedFiles,
        allowedCalls,
        allowedAssistants,
      });
      return;
    }

    await this.createNewSubscription({
      paddleCustomerId,
      status,
      id,
      publicName,
      currentPeriodEnd,
      price,
      priceId,
      allowedDuration,
      allowedApps,
      allowedFiles,
      allowedCalls,
      allowedAssistants,
    });
  }

  private async updateExistingSubscription({
    paddleCustomerId,
    status,
    currentPeriodEnd,
    allowedDuration,
    allowedApps,
    allowedFiles,
    allowedCalls,
    allowedAssistants,
  }: ProcessSubscriptionParams) {
    const customerData = await this.fetchPaddleCustomer(paddleCustomerId)
    const email = customerData.data.email

    // Update subscription
    await db
      .update(subscriptions)
      .set({
        status: status === "active" ? "ACTIVE" : "CANCELLED",
        statusFormatted: status,
        renewsAt: currentPeriodEnd ?? null,
        isPaused: false,
        allowedDuration,
        allowedApps,
        allowedFiles,
        allowedCalls,
        allowedAssistants,
      })
      .where(eq(subscriptions.email, email))

    // Update user's call limit
    if (allowedCalls) {
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1)

      if (user) {
        await db
          .update(users)
          .set({ calls: allowedCalls })
          .where(eq(users.id, user.id))
      }
    }
  }

  private async createNewSubscription({
    paddleCustomerId,
    status,
    id,
    publicName,
    currentPeriodEnd,
    price,
    priceId,
    allowedDuration,
    allowedApps,
    allowedFiles,
    allowedCalls,
    allowedAssistants,
  }: ProcessSubscriptionParams) {
    const customerData = await this.fetchPaddleCustomer(paddleCustomerId)
    const email = customerData.data.email

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) throw new Error("User not found")

    await db.insert(subscriptions).values({
      userId: user.id,
      orderId: parseInt(id),
      name: customerData.data.name || "Unknown",
      email,
      status: status === "active" ? "ACTIVE" : "CANCELLED",
      statusFormatted: status,
      price: price.toString(),
      renewsAt: currentPeriodEnd ?? null,
      isUsageBased: false,
      isPaused: false,
      allowedDuration: allowedDuration,
      allowedApps: allowedApps,
      allowedFiles: allowedFiles,
      allowedCalls: allowedCalls,
      allowedAssistants: allowedAssistants,
    })

    // Update user's call limit based on the subscription
    await db
      .update(users)
      .set({ calls: allowedCalls })
      .where(eq(users.id, user.id))
  }

  private async fetchPaddleCustomer(
    customerId: string
  ): Promise<PaddleCustomerResponse> {
    const response = await fetch(
      `https://api.paddle.com/customers/${customerId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch Paddle customer: ${response.statusText}`)
    }

    return response.json()
  }

  private extractSubscriptionData(
    eventData: SubscriptionCreatedEvent | SubscriptionUpdatedEvent
  ): ProcessSubscriptionParams {
    const subscription = eventData.data;
    console.log('Raw subscription data:', JSON.stringify(subscription, null, 2));
    
    if (!subscription?.customerId) throw new Error("Invalid subscription data");

    const item = subscription.items[0];
    if (!item) throw new Error("No subscription items found");

    const price = item.price;
    if (!price) throw new Error("No price information found");

    const productCustomData = (item.product?.customData as Record<string, string>) || {};
    
    // Log parsed values
    const parsed = {
      allowedDuration: parseInt(productCustomData.allowedDuration || "75"),
      allowedApps: parseInt(productCustomData.allowedApps || "5"),
      allowedFiles: parseInt(productCustomData.allowedFiles || "5"), 
      allowedCalls: parseInt(productCustomData.allowedCalls || "200"),
      allowedAssistants: parseInt(productCustomData.allowedAssistants || "3")
    };
    console.log('Parsed integer values:', parsed);

    return {
      paddleCustomerId: subscription.customerId,
      status: subscription.status,
      id: subscription.id,
      publicName: item.product?.name || "",
      currentPeriodEnd: subscription.currentBillingPeriod?.endsAt || "",
      priceId: price.id,
      price: price.unitPrice?.amount || "0",
      ...parsed
    };
  }
}
