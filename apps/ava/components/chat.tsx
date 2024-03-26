'use client'

import { useChat, type Message } from 'ai/react'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { Howl } from 'howler'
import { toast } from 'react-hot-toast'
import ChatPanel from './chat-panel'
import { useState } from 'react'

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'

const AGENT_ENABLED = process.env.NEXT_PUBLIC_AVA_AGENT_MODE === 'true'
const TTS_MUTED = process.env.NEXT_PUBLIC_TTS_MUTED === 'true'
export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

export default function Chat({ id, initialMessages, className }: ChatProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const { messages, append, reload, stop, isLoading, input, setInput, data } =
    useChat({
      api: AGENT_ENABLED ? '/api/chat/agents' : '/api/chat',
      initialMessages,
      id,
      body: {
        id
      },
      async onResponse(response) {
        if (response.status === 401) {
          toast.error(response.statusText)
        }
      },
      async onFinish(message: Message) {
        console.log("I am called")
        console.log(message, data)
        if (message.role === 'assistant') {
          if (TTS_MUTED) {
            return
          }

          await fetchAndPlayAudio(message.content)
        }
      }
    })

  async function fetchAndPlayAudio(text: string) {
    try {
      // Preparing the data to send in the request
      const requestBody = JSON.stringify({ text })

      // Fetch the audio data from the endpoint
      const response = await fetch(
        AGENT_ENABLED ? '/api/speech' : '/api/speech/simple',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: requestBody
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Get the audio Blob URL from the response
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      playAudio(audioUrl)
    } catch (error) {
      console.log(error)
    }
  }

  function playAudio(audioUrl: string) {
    const sound = new Howl({
      src: [audioUrl],
      format: ['mp3', 'wav', 'mpeg'], // Specify the audio format if known, it helps with compatibility
      autoplay: true, // Play automatically
      onloaderror: function (id, error) {
        console.error('Error during the load of the audio', error)
      },
      onplayerror: function (id, error) {
        console.error('Error during the playback of the audio', error)
        setIsPlaying(false)
      },
      onplay: function () {
        setIsPlaying(true)
      },
      onend: function () {
        setIsPlaying(false)
      }
    })
  }

  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        onHumanSpeechStart={() => {
          setIsPlaying(false)
        }}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
      />
    </>
  )
}
