// components/PromptForm.tsx

'use client'

import * as React from 'react'
import { useActions, useUIState } from 'ai/rsc'
import { useTranscription } from '@bishwenduk029/ai-voice/ui'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { ChatForm } from './chat-form'
import { VoiceForm } from './voice-form'
import { AI } from '../lib/chat/actions'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { IconClose, IconMic, IconSeparator } from './ui/icons'
import { Label } from '@radix-ui/react-dropdown-menu'
import { Input } from './ui/input'
import { FeatherIcon } from 'lucide-react'
import { PopoverAnchor, PopoverArrow } from '@radix-ui/react-popover'
import { motion } from 'framer-motion'

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
  const [open, setOpen] = React.useState(false)
  const [recorderOpen, setRecorderOpen] = React.useState(false)
  const [writerOpen, setWriterOpen] = React.useState(false)
  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState<typeof AI>()
  const { listening, vad, text, isTranscribing, setAccumulatedText } =
    useTranscription({
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
    <div>
      <Popover
        open={open}
        onOpenChange={open => {
          if (!open) {
            vad.pause()
          }
        }}
      >
        <PopoverAnchor asChild>
          <div className="flex flex-row justify-between border-t max-w-96 mx-auto px-4 py-2 shadow-2xl shadow-purple-200 sm:rounded-2xl sm:border md:py-4">
            <PopoverTrigger>
              <Button
                size="lg"
                className="p-5 flex flex-row space-x-2"
                onClick={() => {
                  setRecorderOpen(!recorderOpen)
                  setOpen(!open)
                  setVoiceMode(true)
                }}
              >
                {recorderOpen ? <IconClose /> : <IconMic className="" />}
                <span className="hidden text-lg sm:inline">
                  {recorderOpen ? 'Close' : 'Records'}
                </span>
              </Button>
            </PopoverTrigger>
            <IconSeparator className="size-12 text-muted-foreground/50" />
            <PopoverTrigger>
              <Button
                size="lg"
                className="p-5 flex flex-row space-x-2"
                onClick={() => {
                  setWriterOpen(!writerOpen)
                  setOpen(!open)
                  setVoiceMode(false)
                }}
              >
                {writerOpen ? <IconClose /> : <FeatherIcon className="" />}
                <span className="hidden text-lg sm:inline">
                  {writerOpen ? 'Close' : 'Write'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="sm:w-[800px] bg-white">
              {voiceMode ? (
                <VoiceForm
                  vad={vad}
                  text={text}
                  setMessages={setMessages}
                  submitUserMessage={submitUserMessage}
                  onCancel={() => {
                    setOpen(false)
                    setRecorderOpen(false)
                  }}
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
            </PopoverContent>
          </div>
        </PopoverAnchor>
      </Popover>
    </div>
  )
}

// {voiceMode ? (
//   <VoiceForm
//     vad={vad}
//     text={text}
//     setMessages={setMessages}
//     submitUserMessage={submitUserMessage}
//     setVoiceMode={setVoiceMode}
//     isTranscribing={isTranscribing}
//   />
// ) : (
//   <ChatForm
//     vad={vad}
//     setInput={setInput}
//     input={input}
//     setMessages={setMessages}
//     placeholders={placeholders}
//     setVoiceMode={setVoiceMode}
//   />
// )}
