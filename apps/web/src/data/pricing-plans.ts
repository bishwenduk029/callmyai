import { type PricingPlan } from "@/types"

import { env } from "@/env.mjs"

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free Forever",
    description: "Perfect for individuals expecting lower call volumes",
    features: [
      "50 calls per month",
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
    id: "standard",
    name: "Standard",
    description: "Perfect for individuals expecting higher call volumes",
    features: [
      "Handle 200 calls per month",
      "Filtered Call Summaries",
      "Each call of duration 100 seconds",
    ],
    lemonSqueezyVariantId: env.LEMONSQUEEZY_VARIANT_ID,
    limitations: [],
    stripePriceId: "",
    prices: {
      monthly: 9.99,
      yearly: 240,
    },
    stripeIds: {
      monthly: undefined,
      yearly: undefined,
    },
    buttonText: "Coming Soon",
  },
  {
    id: "premium",
    name: "Business Lite",
    description: "Perfect for businesses looking for AI receptionist",
    features: [
      "Handle Unlimited calls per month",
      "Filtered Call Summaries",
      "Each call of duration 100 seconds",
    ],
    lemonSqueezyVariantId: env.LEMONSQUEEZY_VARIANT_ID,
    limitations: [],
    stripePriceId: "",
    prices: {
      monthly: 39.99,
      yearly: 240,
    },
    stripeIds: {
      monthly: undefined,
      yearly: undefined,
    },
    buttonText: "Coming Soon",
  },
]
