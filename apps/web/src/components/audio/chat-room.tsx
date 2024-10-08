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
}

interface ChatRoomUIProps {
  chatSession: ChatRoomSession
}

export const ChatRoomUI = ({ chatSession }: ChatRoomUIProps) => {
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
    startAudioVisualization()
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

  const startAudioVisualization = async () => {
    if (!window) return
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
        const source = audioContextRef.current.createMediaStreamSource(stream)
        source.connect(analyserRef.current)
      } catch (err) {
        console.error("Error accessing microphone:", err)
        return
      }
    }

    const bufferLength = analyserRef.current!.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const updateAudioData = () => {
      analyserRef.current!.getByteFrequencyData(dataArray)

      const avgFreq =
        dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
      const normalizedFrequency = avgFreq / 255
      setAverageFrequency(normalizedFrequency)

      const newAudioData = Array.from({ length: 6 }, (_, i) => {
        // @ts-ignore
        const value = dataArray[i * 4] / 255 // Normalize to 0-1
        return 1 + value * 0.5 // Scale between 1-1.5
      })
      setAudioData(newAudioData)

      animationFrameRef.current = requestAnimationFrame(updateAudioData)
    }

    updateAudioData()
  }

  const stopAudioVisualization = () => {
    voiceClient?.disconnect()
    if (animationFrameRef.current) {
      setAudioData(new Array(6).fill(1))
      cancelAnimationFrame(animationFrameRef.current)
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
          visualization: stopAudioVisualization,
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
    <div className="fixed inset-0 mb-10 flex flex-col items-center justify-center bg-white">
      <div className="relative aspect-square h-full max-h-[600px] w-full max-w-[600px]">
        <div className="absolute inset-0 flex items-center justify-center">
          {audioData.map((scale, i) => (
            <GooeyDiv
              key={i}
              index={i}
              primaryColor={"black"}
              secondaryColor={"#fdfdfd"}
              scale={1 + scale}
            />
          ))}
          <InnerOrb
            primaryColor={"black"}
            secondaryColor={"#fdfdfd"}
            scale={1 + averageFrequency}
          />
        </div>
      </div>
      <div className="absolute bottom-5 rounded px-5 py-2.5 text-white transition-colors">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex flex-row items-baseline justify-center font-urbanist text-xl font-extrabold text-primary">
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
        </div>
      </div>
    </div>
  )
}
