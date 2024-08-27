import { getUserByUsername } from "@/actions/user"

import { env } from "@/env.mjs"
import { psCreateChat } from "@/db/prepared/statements"

export async function POST(request: Request) {
  try {
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
        config: { ...rest, chatId: results[0]?.id },
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
