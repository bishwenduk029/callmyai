import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  DailyVoiceEvent,
  DailyVoiceVisualizer,
  useDailyVoiceClient,
  useDailyVoiceClientEvent,
} from "@callmyai/ai/ui"
import { PhoneCall, PhonePause } from "@phosphor-icons/react"
import { Headset } from "@phosphor-icons/react/dist/ssr"
import { motion } from "framer-motion"
import { Howl } from "howler"

import { fontNunito } from "@/config/fonts"

import { useToast } from "@/hooks/use-toast"

import { Avatar, AvatarImage } from "../ui/avatar"
import { BackgroundGradient } from "../ui/background-gradient"
import { Card, CardContent } from "../ui/card"
import { LoadingSpinner } from "./chat-room-provider"

const ringtone = new Howl({
  src: ["/ringtone.mp3"],
})

export interface ChatRoomSession {
  assistantId?: string
  userId?: string
  userName?: string
  exhausted: boolean
  duration: number
  private: boolean
  baseUrl: string
  userPrompt?: string
  botName?: string
  header?: string
  description?: string
  avatar?: string
  actionsOwnerEmail?: string
}

interface CallMyAIRoomProps {
  chatSession: ChatRoomSession
}

export const CallMyAIRoom = ({ chatSession }: CallMyAIRoomProps) => {
  const [isListening, setIsListening] = useState(false)
  const [isLoadingBot, setIsLoadingBot] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [disablePhone, setDisablePhone] = useState(false)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const voiceClient = useDailyVoiceClient()
  const { toast } = useToast()

  useDailyVoiceClientEvent(DailyVoiceEvent.BotConnected, async () => {
    startTimer()
    setIsLoadingBot(false)
    setIsListening(true)
  })

  const startTimer = () => {
    setElapsedTime(0)
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime((prevTime) => {
        if (prevTime >= chatSession.duration) {
          clearInterval(timerIntervalRef.current!)
          toggleListening()
          setDisablePhone(true)
          return chatSession.duration
        }
        return prevTime + 1
      })
    }, 1000)
  }

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
  }

  const toggleListening = async () => {
    setIsLoadingBot(!isListening)
    if (isListening) {
      await voiceClient?.disconnect()
      setIsListening(false)
    } else {
      try {
        await voiceClient?.connect()
        setIsListening(true)
      } catch (error) {
        console.error("Failed to start voice client:", error)
        toast({
          title: "Failed to Connect",
          description: "Call Assistant is unavailable",
          variant: "destructive",
        })
        setIsListening(false)
      }
    }
    const actions = isListening
      ? {
          timer: stopTimer,
        }
      : {
          visualization: () => {},
          timer: () => {},
        }

    await Promise.all(
      Object.values(actions).map(async (action) => {
        if (action) {
          if (typeof action === "function") {
            await action()
          } else {
            action
          }
        }
      })
    )
  }

  useEffect(() => {
    if (isLoadingBot) {
      ringtone.play()
      return
    }
    ringtone.stop()
  }, [isLoadingBot])

  return (
    <div className="fixed w-full inset-0 flex flex-col items-center justify-center bg-gradient-to-r from-[#fbed96] to-[#abecd6] p-4 sm:p-0">
      <BackgroundGradient className="dark:bg-zinc-900 w-full rounded-[22px] bg-white p-1">
        <Card className="border-none py-4 shadow-xl">
          <CardContent className="flex flex-col items-center">
            {chatSession.avatar ? (
              <Avatar className="mb-4 size-24 rounded-full border-4 border-green-500 shadow-lg shadow-green-300">
                (
                <Image
                  className="h-full w-full object-cove p-0"
                  src={chatSession.avatar!}
                  width={96}
                  height={96}
                  alt={chatSession.botName || "Bot"}
                />
                )
              </Avatar>
            ) : (
              <div className="mb-4 rounded-full border-4 border-green-500 bg-white p-2 shadow-xl shadow-green-300">
                <Headset size={64} className="text-primary" weight="duotone" />
              </div>
            )}
            <div className={`mb-2 text-2xl font-bold ${fontNunito.variable}`}>
              {chatSession.botName || "AI Call Screener"}
            </div>
            <div
              className={`mb-8 text-lg font-semibold text-muted-foreground ${fontNunito.variable}`}
            >
              {chatSession.description || "AI powered Call Assistant"}
            </div>
            <div className="mb-4 flex flex-row items-baseline justify-center font-urbanist text-xl font-extrabold text-primary">
              {isListening && (
                <div className="mr-2 h-4 w-4 animate-pulse rounded-full bg-red-500"></div>
              )}
              <span>
                {elapsedTime}s of {chatSession.duration}s
              </span>
            </div>
            <DailyVoiceVisualizer
              participantType="bot"
              barColor="#0ea5e9"
              barGap={4}
              barWidth={8}
              barMaxHeight={48}
            />
            {!disablePhone && (
              <motion.button
                className="rounded px-5 py-2.5 text-white transition-colors"
                whileHover={{ scale: 1.2 }}
                onClick={toggleListening}
                disabled={isLoadingBot}
              >
                {isLoadingBot ? (
                  <LoadingSpinner size={75} className="text-primary" />
                ) : isListening ? (
                  <PhonePause
                    size={75}
                    className="rounded-full bg-primary p-2"
                  />
                ) : (
                  <PhoneCall
                    size={75}
                    className="rounded-full bg-primary p-2 text-primary-foreground"
                  />
                )}
              </motion.button>
            )}
          </CardContent>
        </Card>
      </BackgroundGradient>
    </div>
  )
}
