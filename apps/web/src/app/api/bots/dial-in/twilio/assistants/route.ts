import { headers } from "next/headers"
import { getAssistantByPhone } from "@/actions/assistant"
import { redis } from "@callmyai/kv"
import { Ratelimit } from "@upstash/ratelimit"
import { eq } from "drizzle-orm"

import { env } from "@/env.mjs"
import { db } from "@/config/db"
import { psCreateChat } from "@/db/prepared/statements"
import { assistants } from "@/db/schema"

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

    // Parse form data instead of JSON
    const formData = await request.formData()
    // Log all form data entries
    // for (const [key, value] of formData.entries()) {
    //   console.log(`Form Data - ${key}: ${value}`)
    // }
    const CallSid = formData.get("CallSid")?.toString()
    const assistantPhoneNumber = formData.get("To")?.toString()

    if (!CallSid) throw new Error("CallSid is required")

    if (!assistantPhoneNumber)
      throw new Error("User phone number called is required")

    const assistantResult = await getAssistantByPhone({
      phone: assistantPhoneNumber,
    })

    if (!assistantResult) throw new Error("Assistant not found")

    const results = await psCreateChat.execute({
      userId: assistantResult.data?.assistant.userId,
      visitorId: null,
      assistantId: assistantResult.data?.assistant.id,
    })

    const response = await fetch(env.VOICE_TWILIO_BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        config: {
          ...assistantResult.data?.config,
          chatId: results[0]?.id,
          sip: {
            enabled: true,
            callId: CallSid,
          },
        },
      }),
    })

    // Return the response text directly without modifying headers
    return new Response(await response.text(), {
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    console.error("Error handling request:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
