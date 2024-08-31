"use server"
import { headers } from "next/headers"
import { redis } from "@callmyai/kv"
import { Ratelimit } from "@upstash/ratelimit"
import { createSafeActionClient } from "next-safe-action"
import { z } from "zod"

// Initialize rate limiter
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10s"),
  analytics: true,
  prefix: "ratelimit",
})

export const actionClient = createSafeActionClient({
  handleReturnedServerError(e) {
    if (e instanceof Error) {
      return e.message
    }
    return "An unexpected error occurred"
  },
})

export const actionClientWithMeta = createSafeActionClient({
  handleReturnedServerError(e) {
    if (e instanceof Error) {
      return e.message
    }
    return "An unexpected error occurred"
  },
  defineMetadataSchema() {
    return z.object({
      name: z.string(),
    })
  },
})

export const ratelimitedActionClient = actionClientWithMeta.use(
  async ({ next, metadata }) => {
    const ip = headers().get("x-forwarded-for") || "127.0.0.1"

    const { success, remaining } = await ratelimit.limit(
      `${ip}-${metadata.name}`
    )

    if (!success) {
      throw new Error("TOO_MANY_REQUESTS")
    }

    return next({
      ctx: {
        ratelimit: {
          remaining,
        },
      },
    })
  }
)
