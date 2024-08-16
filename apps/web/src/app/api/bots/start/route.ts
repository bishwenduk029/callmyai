import { env } from "@/env.mjs"

import auth from "@/lib/auth"

export async function POST(request: Request) {
  const session = await auth()

  if (!session)
    return Response.json({ error: "You must be logged in." }, { status: 401 })

  try {
    const body = await request.text()
    const response = await fetch(env.VOICE_BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type":
          request.headers.get("Content-Type") || "application/json",
      },
      body: body,
    })

    const data = await response.text()

    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
      },
    })
  } catch (error) {
    console.error("Error handling request:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
