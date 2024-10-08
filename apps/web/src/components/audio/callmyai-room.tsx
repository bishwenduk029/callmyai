import { useEffect, useRef, useState } from "react"
import {
  DailyVoiceEvent,
  useDailyVoiceClient,
  useDailyVoiceClientEvent,
} from "@callmyai/ai/ui"
import { PhoneCall, PhonePause } from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { Howl } from "howler"

import { useToast } from "@/hooks/use-toast"

import { LoadingSpinner } from "./chat-room-provider"
import { GooeyDiv } from "./gooey-div"
import { InnerOrb } from "./inner-orb"
import { Card, CardContent } from "../ui/card"
import { fontNunito } from "@/config/fonts"
import { Avatar } from "../ui/avatar"
import { AvatarImage } from "@radix-ui/react-avatar"

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
}

interface CallMyAIRoomProps {
  chatSession: ChatRoomSession
}

export const CallMyAIRoom = ({ chatSession }: CallMyAIRoomProps) => {
  const [isListening, setIsListening] = useState(false)
  const [isLoadingBot, setIsLoadingBot] = useState(false)
  const [audioData, setAudioData] = useState<number[]>(new Array(6).fill(1))
  const [averageFrequency, setAverageFrequency] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [disablePhone, setDisablePhone] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
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
        await voiceClient?.start()
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
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#B7F8DB] to-[#50A7C2] p-4 sm:p-0">
      <Card className="w-full max-w-md m-auto shadow-lg p-4">
        <CardContent className="flex flex-col items-center">
          <Avatar className="w-48 h-48 rounded-full mb-4 border-4 shadow-xl shadow-green-300 border-green-500">
            <AvatarImage src={chatSession.avatar} />
          </Avatar>
          <div className={`text-2xl font-bold mb-2 ${fontNunito.variable}`}>{chatSession.botName}</div>
          <div className={`text-lg font-semibold text-gray-600 mb-8 ${fontNunito.variable}`}>{chatSession.description}</div>
          <div className="flex flex-row items-baseline justify-center font-urbanist text-xl font-extrabold text-primary mb-4">
            {isListening && (
              <div className="mr-2 h-4 w-4 animate-pulse rounded-full bg-red-500"></div>
            )}
            <span>
              {elapsedTime}s of {chatSession.duration}s
            </span>
          </div>
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
                <PhonePause size={75} className="rounded-full bg-primary p-2" />
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
    </div>
  )
}
