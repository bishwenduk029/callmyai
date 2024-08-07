// AudioReactiveInterface.tsx
"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { summarizeCall } from "@/actions/user"
import { Spinner } from "@phosphor-icons/react"
import { PhoneCall, PhonePause } from "@phosphor-icons/react/dist/ssr"
import { CoreAssistantMessage, CoreMessage, CoreUserMessage } from "ai"
import { motion } from "framer-motion"
import { Transcript, VoiceEvent } from "realtime-ai"
import { useVoiceClient, useVoiceClientEvent } from "realtime-ai-react"

import { GooeyDiv } from "./gooey-div"
import { InnerOrb } from "./inner-orb"

interface AudioReactiveInterfaceProps {
  chatId: string
  personalMode: boolean
}

export const AudioReactiveInterface = ({
  chatId,
  personalMode,
}: AudioReactiveInterfaceProps) => {
  const [primaryColor, setPrimaryColor] = useState("black")
  const [secondaryColor, setSecondaryColor] = useState("#fdfdfd")
  const [audioData, setAudioData] = useState<number[]>(new Array(6).fill(1))
  const [isListening, setIsListening] = useState(false)
  const [isLoadingBot, setIsLoadingBot] = useState(false)
  const [averageFrequency, setAverageFrequency] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [messages, setMessages] = useState<CoreMessage[]>([])
  const voiceClient = useVoiceClient()

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  useVoiceClientEvent(
    VoiceEvent.BotConnected,
    useCallback(() => {
      startTimer()
      setIsListening(true)
      setIsLoadingBot(false)
    }, [])
  )

  useVoiceClientEvent(
    VoiceEvent.BotTranscript,
    useCallback((transcript: string) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: transcript } as CoreAssistantMessage,
      ])
    }, [])
  )

  useVoiceClientEvent(
    VoiceEvent.UserTranscript,
    useCallback((transcript: Transcript) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", content: transcript.text } as CoreUserMessage,
      ])
    }, [])
  )

  const startTimer = () => {
    setElapsedTime(0)
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime((prevTime) => {
        if (prevTime >= 100) {
          clearInterval(timerIntervalRef.current!)
          return 100
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
      voiceClient?.start()

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
    if (isListening) {
      voiceClient?.disconnect()
    } else {
      setIsLoadingBot(true)
      voiceClient?.start()
    }
    const actions = isListening
      ? {
          visualization: stopAudioVisualization,
          timer: personalMode ? null : stopTimer,
          summarize: personalMode ? null : async () => await summarizeCall(chatId, messages),
        }
      : {
          visualization: startAudioVisualization,
        }

    await Promise.all(Object.values(actions).map(async (action) => {
      if (action) {
        if (typeof action === 'function') {
          await action()
        } else {
          action
        }
      }
    }))

    setIsListening(!isListening)
  }

  useEffect(() => {
    if (elapsedTime >= 100) {
      toggleListening()
    }
  }, [elapsedTime])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <div className="relative aspect-square h-full max-h-[600px] w-full max-w-[600px]">
        <div className="absolute inset-0 flex items-center justify-center">
          {audioData.map((scale, i) => (
            <GooeyDiv
              key={i}
              index={i}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              scale={scale}
            />
          ))}
          <InnerOrb
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            scale={1 + averageFrequency}
          />
        </div>
      </div>
      <div className="absolute bottom-5 rounded px-5 py-2.5 text-white transition-colors">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex flex-row items-baseline justify-center font-urbanist text-2xl font-extrabold text-primary">
            {isListening && (
              <div className="mr-2 h-4 w-4 animate-pulse rounded-full bg-red-500"></div>
            )}
            {!personalMode && <span>{elapsedTime}s of 100s</span>}
          </div>
          <motion.button
            className="rounded px-5 py-2.5 text-white transition-colors"
            whileHover={{
              scale: 1.2,
            }}
            onClick={toggleListening}
            disabled={isLoadingBot}
          >
            {isLoadingBot ? (
              <Spinner
                size={75}
                className="animate-spin rounded-full bg-primary p-2"
              />
            ) : isListening ? (
              <PhonePause size={75} className="rounded-full bg-primary p-2" />
            ) : (
              <PhoneCall
                size={75}
                className="rounded-full bg-primary p-2 text-primary-foreground"
              />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
