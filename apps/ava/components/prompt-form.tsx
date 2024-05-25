// components/PromptForm.tsx

'use client'

import * as React from 'react'
import { useActions, useUIState } from 'ai/rsc'
import { useTranscription } from '@bishwenduk029/ai-voice/ui'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { ChatForm } from './chat-form'
import { VoiceForm } from './voice-form'
import { AI } from '../lib/chat/actions'

const placeholders = [
  'I need to send the presentation by 12:00PM today',
  'I should setup a call with Marley today evening',
  'Make a note that glaciers are large slabs of ice',
  'Summarize my thoughts, so life is all ...',
  'How to assemble your own PC?'
]

export function PromptForm({
  input,
  setInput
}: {
  input: string
  setInput: (value: string) => void
}) {
  const [voiceMode, setVoiceMode] = React.useState(false)
  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState<typeof AI>()
  const { listening, vad, text, isTranscribing, setAccumulatedText } = useTranscription({
    api: '/api/transcribe',
    speakerPause: 60000
  })

  React.useEffect(() => {
    setAccumulatedText('')
    if (voiceMode) {
      vad.start()
    } else {
      vad.pause()
    }
    return () => {
      vad.pause()
      setAccumulatedText('')
    }
  }, [voiceMode])

  return (
    <>
      {voiceMode ? (
        <VoiceForm
          vad={vad}
          text={text}
          setMessages={setMessages}
          submitUserMessage={submitUserMessage}
          setVoiceMode={setVoiceMode}
          isTranscribing={isTranscribing}
        />
      ) : (
        <ChatForm
          vad={vad}
          setInput={setInput}
          input={input}
          setMessages={setMessages}
          placeholders={placeholders}
          setVoiceMode={setVoiceMode}
        />
      )}
    </>
  )
}
