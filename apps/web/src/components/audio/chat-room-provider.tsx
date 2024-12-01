// AudioReactiveInterface.tsx
"use client"

import { useEffect, useState } from "react"
import {
  DailyTransport,
  DailyVoiceClient,
  DailyVoiceClientAudio,
  DailyVoiceClientProvider,
} from "@callmyai/ai/ui"

import { User } from "@/db/schema"

import { cn } from "@/lib/utils"

import { CallMyAIRoom } from "./callmyai-room"
import { ChatRoomSession } from "./chat-room"

interface ChatRoomProps {
  visitor?: User | null | undefined
  session: ChatRoomSession
  configuration: any
  isTrial?: boolean
}

export const DailyChatRoomProvider = ({
  visitor,
  session,
  configuration,
  isTrial = false,
}: ChatRoomProps) => {
  const [voiceClient, setVoiceClient] = useState<DailyVoiceClient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const dailyTransport = new DailyTransport()

  useEffect(() => {
    const initializeVoiceClient = async () => {
      try {
        const client = new DailyVoiceClient({
          transport: dailyTransport,
          params: {
            baseUrl: session.baseUrl,
            enableMic: true,
          },
          config: {
            ...configuration,
            llm: {
              ...configuration.llm,
              messages: [
                {
                  role: "system",
                  content:
                    configuration.description +
                    "\n " +
                    (configuration.selectedPersona?.systemPrompt?.replace(
                      /\${name}/g,
                      configuration.name!
                    ) || "Hello! How can I help you today?"),
                },
              ],
            },
            assistantId: session.assistantId,
            userName: session.userName,
            actionsOwnerEmail: session.actionsOwnerEmail,
          },
        })
        setVoiceClient(client)
        setIsLoading(false)
      } catch (error) {
        console.error("Error initializing voice client:", error)
        setError(true)
        setIsLoading(false)
      }
    }

    initializeVoiceClient()
  }, [])

  if (!voiceClient || isLoading) {
    return <Loader isLoading={isLoading} error={error} />
  }

  return (
    <DailyVoiceClientProvider client={voiceClient!}>
      <div>
        <CallMyAIRoom chatSession={session} isTrial={isTrial} />
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
