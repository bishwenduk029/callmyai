export interface Subscription {
  userId: string
  orderId: number
  name: string
  email: string
  status: string
  statusFormatted: string
  planId: string
  price: string
  renewsAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface SubscriptionUpdate {
  status: string
  statusFormatted: string
  renewsAt: Date
  updatedAt: Date
} 