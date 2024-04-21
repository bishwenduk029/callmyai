'use client'

import { useChat, type Message } from 'ai/react'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import ChatPanel from './chat-panel'
import { useVoiceChat } from '@bishwenduk029/ai-voice/ui'
import { getChat } from '@/app/actions'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages: Message[]
  id?: string
}

export default function Chat({ id, initialMessages, className }: ChatProps) {
  const { speaking, listening, thinking, initialized, messages, setMessages } =
    useVoiceChat({
      api: '/api/chat/voice',
      initialMessages,
      transcribeAPI: '/api/transcribe',
      body: {
        id
      },
      speakerPause: 500,
      onSpeechCompletion: async () => {
        if (id) {
          const chat = await getChat(id)
          setMessages(chat?.messages || [])
        }
      }
    })

  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={initialized} />
          </>
        ) : (
          <EmptyScreen />
        )}
      </div>
      <ChatPanel
        id={id}
        initialized={initialized}
        speaking={speaking}
        listening={listening}
        thinking={thinking}
        messages={messages}
      />
    </>
  )
}
