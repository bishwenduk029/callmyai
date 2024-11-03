import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { redis } from "@callmyai/kv"
import { Ratelimit } from "@upstash/ratelimit"
import auth from "@/lib/auth"

// Initialize rate limiter
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10s"),
  analytics: true,
  prefix: "ratelimit",
})

export const GET = auth(async function GET(request) {
  const ip = headers().get("x-forwarded-for") || "127.0.0.1"
  const { success } = await ratelimit.limit(`${ip}-start-bot`)

  if (!success) {
    return Response.json(
      { error: "Too many requests, Pls don't DDoS me" },
      { status: 429 }
    )
  }

  if (!request.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const region = searchParams.get("region")

  if (!region) {
    return NextResponse.json({ error: "Region is required" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://api.daily.co/v1/list-available-numbers?region=${region}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.DAILY_TELEPHONY_API_KEY}`,
        },
      }
    )

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching available numbers:", error)
    return NextResponse.json(
      { error: "Failed to fetch available numbers" },
      { status: 500 }
    )
  }
})
