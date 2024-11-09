export interface PolarWebhookPayload {
  event: PolarWebhookEvent
  data: {
    id: string
    status: string
    customer: {
      id: string
      email: string
    }
    subscription?: {
      id: string
      priceId: string
      status: string
    }
  }
}

export type PolarWebhookEvent =
  | "checkout.created"
  | "checkout.updated"
  | "subscription.created"
  | "subscription.updated"
  | "subscription.active"
  | "subscription.revoked"
  | "subscription.canceled" 