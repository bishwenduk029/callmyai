import { headers } from "next/headers"
import { getUserByUsername } from "@/actions/user"
import { redis } from "@callmyai/kv"
import { Ratelimit } from "@upstash/ratelimit"

import { env } from "@/env.mjs"
import { psCreateChat } from "@/db/prepared/statements"

// Initialize rate limiter
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10s"),
  analytics: true,
  prefix: "ratelimit",
})

export async function POST(request: Request) {
  try {
    const ip = headers().get("x-forwarded-for") || "127.0.0.1"
    const { success } = await ratelimit.limit(`${ip}-start-bot`)

    if (!success) {
      return Response.json(
        { error: "Too many requests, Pls don't DDoS me" },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { userName, ...rest } = body.config
    const user = await getUserByUsername({ username: userName })

    if (!user) throw new Error("User not found")

    const results = await psCreateChat.execute({
      userId: user.id,
      visitorId: null,
    })

    const response = await fetch(env.VOICE_BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        config: { ...rest, chatId: results[0]?.id, sip: { enabled: false } },
      }),
    })

    const data = await response.text()

    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error handling request:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
