import { type PricingPlan } from "@/types"

import { env } from "@/env.mjs"

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free Forever",
    description: "Perfect for when you are just getting started",
    features: [
      "20 calls per month",
      "Filtered Call Summaries",
      "Each call of duration 100 seconds",
    ],
    limitations: [],
    lemonSqueezyVariantId: "2",
    stripePriceId: "",
    prices: {
      monthly: 0,
      yearly: 0,
    },
    stripeIds: {
      monthly: undefined,
      yearly: undefined,
    },
    buttonText: "Get Started",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Perfect for everyday use",
    features: [
      "Handle Unlimited calls per month",
      "Filtered Call Summaries",
      "Each call of duration 100 seconds",
    ],
    lemonSqueezyVariantId: env.LEMONSQUEEZY_VARIANT_ID,
    limitations: [],
    stripePriceId: "",
    prices: {
      monthly: 6.99,
      yearly: 240,
    },
    stripeIds: {
      monthly: undefined,
      yearly: undefined,
    },
    buttonText: "Purchase",
  },
]
