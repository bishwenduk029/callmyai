// /[username]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createChat, getUserByEmail } from "@/actions/user"
import { useSession } from "next-auth/react"
import { VoiceClient } from "realtime-ai"
import { VoiceClientAudio, VoiceClientProvider } from "realtime-ai-react"

import { env } from "@/env.mjs"
import { DEFAULT_UNAUTHENTICATED_REDIRECT } from "@/config/defaults"

import { AudioReactiveInterface } from "@/components/audio/interface"

export default function CallPage({ params }: { params: { username: string } }) {
  const [voiceClient, setVoiceClient] = useState<VoiceClient | null>(null)
  const [chatData, setChatData] = useState<{
    id: string
    userId: string
    exhausted: boolean
    prompt: string | null
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()
  console.log(chatData)

  useEffect(() => {
    console.log(status, session)
    if (status === "unauthenticated") {
      router.push(DEFAULT_UNAUTHENTICATED_REDIRECT)
    } else if (status === "authenticated" && session?.user?.email) {
      initializeChat(session.user.email)
    }
  }, [params.username, status, session])

  async function initializeChat(email: string) {
    console.log("initializing chat")
    try {
      const visitor = await getUserByEmail({ email })
      console.log("visitor")
      console.log(visitor)
      if (visitor) {
        const newChat = await createChat(params.username, visitor)
        setChatData(newChat)
        console.log(voiceClient)
        if (typeof window !== "undefined" && !voiceClient) {
          const client = new VoiceClient({
            baseUrl: env.NEXT_PUBLIC_VOICE_BACKEND_URL || "",
            enableMic: true,
            config: {
              llm: {
                model: "gpt-4o-mini",
                messages: [
                  {
                    role: "system",
                    content: newChat?.prompt || "",
                  },
                ],
              },
              tts: {
                voice: "b7d50908-b17c-442d-ad8d-810c63997ed9",
              },
            },
          })
          setVoiceClient(client)
        }
      }
    } catch (err) {
      console.log(err)
      // setError("Failed to initialize chat. Please try again.")
      return
    }
  }

  if (status === "loading" || !chatData) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-xl font-semibold">{error}</div>
      </div>
    )
  }

  if (chatData.exhausted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-xl font-semibold">
          User has no more calls left.
        </div>
      </div>
    )
  }

  if (!chatData.id) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-xl font-semibold">
          Failed to initialize chat. Please try again.
        </div>
      </div>
    )
  }

  if (!voiceClient) {
    return null
  }

  return (
    <VoiceClientProvider voiceClient={voiceClient}>
      <div className="container">
        <AudioReactiveInterface chatId={chatData.id} personalMode={false} />
      </div>
      <VoiceClientAudio />
    </VoiceClientProvider>
  )
}
