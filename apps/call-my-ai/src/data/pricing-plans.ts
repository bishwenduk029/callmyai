import { type PricingPlan } from "@/types"

export const pricingPlans: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for when you are just getting started",
    features: ["100 calls per month", "Call History reporting", "Each call of duration 100 seconds"],
    limitations: [
    ],
    stripePriceId: "",
    prices: {
      monthly: 9,
      yearly: 84,
    },
    stripeIds: {
      monthly: undefined,
      yearly: undefined,
    },
  },
  {
    id: "premium",
    name: "Premium",
    description: "Perfect for seriously scaling your business",
    features: [
      "Unlimited calls per month", "Call History reporting", "Each call of duration 100 seconds"
    ],
    limitations: [],
    stripePriceId: "",
    prices: {
      monthly: 15,
      yearly: 240,
    },
    stripeIds: {
      monthly: undefined,
      yearly: undefined,
    },
  },
  {
    id: "enterprises",
    name: "Enterprise",
    description: "Perfect for advertizing agencies, call centers and call agencies",
    features: [
      "Unlimited calls per month", "Call History reporting", "Each call of duration 3 mins or more"
    ],
    limitations: [],
    stripePriceId: "",
    prices: {
      monthly: "",
      yearly: 240,
    },
    stripeIds: {
      monthly: undefined,
      yearly: undefined,
    },
  },
]
