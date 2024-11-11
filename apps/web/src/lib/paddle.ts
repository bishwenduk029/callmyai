import {
    CustomerCreatedEvent,
    CustomerUpdatedEvent,
    Environment,
    EventEntity,
    EventName,
    LogLevel,
    Paddle,
    PaddleOptions,
    SubscriptionCreatedEvent,
    SubscriptionUpdatedEvent,
  } from '@paddle/paddle-node-sdk';
  import { eq } from 'drizzle-orm'
  import { db } from '@/config/db'
  import { subscriptions, users } from '@/db/schema'
  import { pricingPlans } from '@/data/pricing-plans'

  export function getPaddleInstance() {
    const paddleOptions: PaddleOptions = {
      environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as Environment) ?? Environment.sandbox,
      logLevel: LogLevel.verbose,
    };
  
    if (!process.env.PADDLE_API_KEY) {
      console.error('Paddle API key is missing');
    }
  
    return new Paddle(process.env.PADDLE_API_KEY!, paddleOptions);
  }

  interface ProcessSubscriptionParams {
    email: string
    status: string
    id: string
    publicName?: string
    currentPeriodEnd?: string
    priceId: string
    price: string
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

    private async updateSubscriptionData(eventData: SubscriptionCreatedEvent | SubscriptionUpdatedEvent) {
      try {
        const subscriptionData = this.extractSubscriptionData(eventData)
        await this.processSubscription(subscriptionData)
      } catch (error) {
        console.error('Failed to update subscription:', error)
        throw error
      }
    }

    private async cancelSubscription(eventData: any) {
      try {
        const email = eventData.data?.user?.email
        if (!email) throw new Error('No email found in cancellation event')

        await db
          .update(subscriptions)
          .set({
            status: 'CANCELLED',
            statusFormatted: 'CANCELLED',
            renewsAt: null,
            isPaused: true,
          })
          .where(eq(subscriptions.email, email))
      } catch (error) {
        console.error('Failed to cancel subscription:', error)
        throw error
      }
    }

    private async processSubscription({ email, status, id, publicName, currentPeriodEnd, priceId, price }: ProcessSubscriptionParams) {
      const plan = pricingPlans.find((p) => p.paddlePriceId === priceId)
      if (!plan) throw new Error(`Invalid price ID: ${priceId}`)

      const existingSub = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.email, email))
        .limit(1)

      if (existingSub.length > 0) {
        await this.updateExistingSubscription({ email, status, plan, currentPeriodEnd })
        return
      }

      await this.createNewSubscription({ email, status, id, publicName, currentPeriodEnd, plan, price, priceId })
    }

    private async updateExistingSubscription({ email, status, plan, currentPeriodEnd }: {
      email: string
      status: string
      plan: any
      currentPeriodEnd?: string
    }) {
      await db
        .update(subscriptions)
        .set({
          status: status === 'active' ? 'ACTIVE' : 'CANCELLED',
          planId: Number(plan.id),
          statusFormatted: status,
          renewsAt: currentPeriodEnd ?? null,
          isPaused: false,
        })
        .where(eq(subscriptions.email, email))
    }

    private async createNewSubscription({ email, status, id, publicName, currentPeriodEnd, plan, price, priceId }: ProcessSubscriptionParams & { plan: any }) {
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1)

      if (!user) throw new Error('User not found')

      await db.insert(subscriptions).values({
        userId: user.id,
        orderId: parseInt(id),
        name: publicName || 'Unknown',
        email,
        status: status === 'active' ? 'ACTIVE' : 'CANCELLED',
        statusFormatted: status,
        planId: Number(plan.id),
        price: price.toString(),
        renewsAt: currentPeriodEnd ?? null,
        isUsageBased: false,
        isPaused: false,
      })
    }

    private extractSubscriptionData(eventData: SubscriptionCreatedEvent | SubscriptionUpdatedEvent): ProcessSubscriptionParams {
      const data = eventData.data
      if (!data?.customerId) throw new Error('Invalid subscription data')

      return {
        email: data.customerId,
        status: data.status.toString(),
        id: data.id,
        publicName: "",
        currentPeriodEnd: data.canceledAt || "",
        priceId: data?.items[0]?.price?.id || "",
        price: data?.items[0]?.price?.unitPrice?.amount || "",
      }
    }
  }