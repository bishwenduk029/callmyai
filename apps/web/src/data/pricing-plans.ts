import { type PricingPlan } from "@/types"

import { env } from "@/env.mjs"

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free Forever",
    description: "Perfect for trying out web based AI phone screener",
    features: [
      "Free Personal AI Call Screener",
      "50 calls per month",
      "Filtered Call Summaries",
      "Each inbound call of duration 75 seconds",
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
    disable: false
  },
  {
    id: "standard",
    name: "Standard",
    description: "Perfect for individuals expecting higher call volumes",
    features: [
      "Free Personal AI Call Screener",
      "Handle 200 calls per month",
      "Filtered Call Summaries",
      "Each call of duration 100 seconds",
      "Create upto 3 AI voice assistants",
      "Connect upto 5 external apps",
      "Connect upto 5 files",
    ],
    polarPriceId: "62d50784-084f-4dbf-bef8-1392eee03062",
    lemonSqueezyVariantId: env.LEMONSQUEEZY_VARIANT_ID,
    paddlePriceId: "pro_01jdc11915hwvrzyb24efe0nsg",
    limitations: [],
    stripePriceId: "",
    prices: {
      monthly: 9,
      yearly: 240,
    },
    stripeIds: {
      monthly: undefined,
      yearly: undefined,
    },
    buttonText: "Get Started",
    disable: false
  },
  {
    id: "premium",
    name: "Premium",
    description: "Perfect for AI Voice Experience Designers",
    features: [
      "Free Personal AI Call Screener",
      "Handle 500 calls per month",
      "Filtered Call Summaries",
      "Each call of duration 200 seconds",
      "Create upto 5 AI voice assistants",
      "Connect upto 10 external apps",
      "Connect upto 10 files",
    ],
    lemonSqueezyVariantId: env.LEMONSQUEEZY_VARIANT_ID,
    polarPriceId: "b169b804-ce8e-4997-bcce-274ed729e4c9",
    limitations: [],
    stripePriceId: "",
    prices: {
      monthly: 25,
      yearly: 240,
    },
    stripeIds: {
      monthly: undefined,
      yearly: undefined,
    },
    buttonText: "Get Started",
    disable: false
  },
]
