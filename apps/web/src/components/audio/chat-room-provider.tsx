// AudioReactiveInterface.tsx
"use client"

import { useEffect, useState } from "react"
import { createNewChatSession } from "@/actions/user"
import {
  DailyVoiceClient,
  DailyVoiceClientAudio,
  DailyVoiceClientProvider,
} from "@bishwenduk029/ai-voice/ui"

import { User } from "@/db/schema"

import { cn } from "@/lib/utils"

import { ChatRoomUI } from "./chat-room"

export interface ChatSession {
  id: string
  userId: string
  prompt: string
  exhausted: boolean
  duration: number
  private: boolean
}

interface ChatRoomProps {
  visitor: User | null | undefined
  hostUsername: string
}

export const ChatRoomProvider = ({ visitor, hostUsername }: ChatRoomProps) => {
  const [voiceClient, setVoiceClient] = useState<DailyVoiceClient | null>(null)
  const [chatSession, setChatSession] = useState<ChatSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const initializeVoiceClient = async () => {
      try {
        const newChatSession = await createNewChatSession(hostUsername, visitor)
        const client = new DailyVoiceClient({
          baseUrl: "/api/bots/start",
          enableMic: true,
          config: {
            llm: {
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: newChatSession?.prompt || "",
                },
              ],
            },
            tts: {
              voice: "b7d50908-b17c-442d-ad8d-810c63997ed9",
            },
            // @ts-ignore
            chatId: newChatSession.id,
          },
        })
        setVoiceClient(client)
        setChatSession(newChatSession)
        setIsLoading(false)
      } catch (error) {
        console.error("Error initializing voice client:", error)
        setError(true)
        setIsLoading(false)
      }
    }

    initializeVoiceClient()
  }, [])

  if (!chatSession || !voiceClient || isLoading) {
    return <Loader isLoading={isLoading} error={error} />
  }

  return (
    <DailyVoiceClientProvider voiceClient={voiceClient}>
      <div>
        <ChatRoomUI chatSession={chatSession} />
        <DailyVoiceClientAudio />
      </div>
    </DailyVoiceClientProvider>
  )
}

const Loader = ({
  isLoading,
  error,
}: {
  isLoading: boolean
  error: boolean
}) => (
  <div className="fixed inset-0 flex items-center justify-center">
    {isLoading ? (
      <LoadingSpinner size={75} className="" />
    ) : error ? (
      "Failed to initialize chat room"
    ) : (
      ""
    )}
  </div>
)

export const LoadingSpinner = ({
  className,
  size,
}: {
  className: string
  size: number
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("animate-spin", className)}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)
