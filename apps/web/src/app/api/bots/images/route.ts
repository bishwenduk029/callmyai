import { headers } from "next/headers"
import { redis } from "@callmyai/kv"
import { route } from "@fal-ai/serverless-proxy/nextjs"
import { Ratelimit } from "@upstash/ratelimit"
import { NextRequest } from "next/server"

// Initialize rate limiter
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10s"),
  analytics: true,
  prefix: "ratelimit",
})

// Let's add some custom logic to POST requests - i.e. when the request is
// submitted for processing
export const POST = async (req: NextRequest) => {
  const ip = headers().get("x-forwarded-for") || "127.0.0.1"
  const { success } = await ratelimit.limit(`${ip}-images-fal`)

  if (!success) {
    return Response.json(
      { error: "Too many requests, Pls don't DDoS me" },
      { status: 429 }
    )
  }

  // If everything passed your custom logic, now execute the proxy handler
  return route.POST(req)
}

// For GET requests we will just use the built-in proxy handler
// But you could also add some custom logic here if you need
export const GET = route.GET
