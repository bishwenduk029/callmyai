// /[username]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createChat, getUserByEmail } from "@/actions/user"
import {
  DailyVoiceClient,
  DailyVoiceClientAudio,
  DailyVoiceClientProvider,
} from "@bishwenduk029/ai-voice/ui"
import { useSession } from "next-auth/react"

import { env } from "@/env.mjs"
import { DEFAULT_UNAUTHENTICATED_REDIRECT } from "@/config/defaults"

import { AudioReactiveInterface } from "@/components/audio/interface"

interface ChatData {
  id: string
  userId: string
  prompt: string
  exhausted: boolean
  duration: number
}

export default function CallPage({ params }: { params: { username: string } }) {
  const [voiceClient, setVoiceClient] = useState<DailyVoiceClient | null>(null)
  const [chatData, setChatData] = useState<ChatData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(DEFAULT_UNAUTHENTICATED_REDIRECT)
    } else if (
      status === "authenticated" &&
      session?.user?.email &&
      !voiceClient
    ) {
      initializeChat(session.user.email)
    }
  }, [params.username, status, session])

  async function initializeChat(email: string) {
    try {
      const visitor = await getUserByEmail({ email })
      if (visitor) {
        const newChat = await createChat(params.username, visitor)
        setChatData(newChat)
        if (typeof window !== "undefined" && !voiceClient) {
          const client = new DailyVoiceClient({
            baseUrl: "/api/bots/start",
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
              // @ts-ignore
              chatId: newChat.id,
            },
          })
          setVoiceClient(client)
        }
      }
    } catch (err) {
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
    <DailyVoiceClientProvider voiceClient={voiceClient}>
      <div className="container">
        <AudioReactiveInterface
          chatId={chatData.id}
          personalMode={false}
          allowedCallDuration={chatData.duration}
        />
      </div>
      <DailyVoiceClientAudio />
    </DailyVoiceClientProvider>
  )
}
