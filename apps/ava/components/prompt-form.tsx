'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { useActions, useUIState } from 'ai/rsc'

import { UserMessage } from './stocks/message'
import { type AI } from '@/lib/chat/actions'
import { Button } from '@/components/ui/button'
import { IconArrowElbow, IconPlus, IconMic } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholder-and-vanish-input'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AtomIcon,
  CircleCheck,
  CircleX,
  Dot,
  DotIcon,
  EarOff
} from 'lucide-react'
import { useTranscription } from '@bishwenduk029/ai-voice/ui'

const placeholders = [
  'I need to send the presentatin by 12:00PM today',
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
  const { formRef, onKeyDown } = useEnterSubmit()
  const [voiceMode, setVoiceMode] = React.useState(false)
  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState<typeof AI>()
  const { listening, vad, setStartRecording, text } = useTranscription({
    api: '/api/transcribe',
    speakerPause: 60000
  })

  const ChatForm = ({ formRef, setInput, input, setMessages }: any) => {
    return (
      <form
        className="bg-white text-black dark:text-white"
        ref={formRef}
        onSubmit={async (e: any) => {
          e.preventDefault()

          // Blur focus on mobile
          if (window.innerWidth < 600) {
            e.target['message']?.blur()
          }

          const value = input.trim()
          setInput('')
          if (!value) return

          // Optimistically add user message UI
          setMessages((currentMessages: any) => [
            ...currentMessages,
            {
              id: nanoid(),
              display: <UserMessage>{value}</UserMessage>
            }
          ])

          // Submit and get response message
          const responseMessage = await submitUserMessage(value)
          setMessages((currentMessages: any) => [
            ...currentMessages,
            responseMessage
          ])
        }}
      >
        <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-4 sm:rounded-md sm:px-6">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onKeyDown={onKeyDown}
            onChange={e => setInput(e.target.value)}
          />

          <div className="absolute right-0 top-[13px] sm:right-4 flex-row justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="icon"
                  disabled={input === ''}
                  className="mr-2"
                >
                  <IconArrowElbow />
                  <span className="sr-only">Send message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  className=""
                  onClick={e => {
                    e.preventDefault()
                    setVoiceMode(true)
                    setStartRecording(true)
                  }}
                >
                  <IconMic />
                  <span className="sr-only">Speak With Ava</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Speak With Ava</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </form>
    )
  }

  const VoiceForm = ({ formRef, setInput, input, setMessages }: any) => {
    return (
      <form
        className="bg-white text-black border-neutral-200 flex align-middle justify-center"
        ref={formRef}
        onSubmit={async (e: any) => {
          e.preventDefault()

          // Blur focus on mobile
          if (window.innerWidth < 600) {
            e.target['message']?.blur()
          }

          const value = input.trim()
          setInput('')
          if (!value) return

          // Optimistically add user message UI
          setMessages((currentMessages: any) => [
            ...currentMessages,
            {
              id: nanoid(),
              display: <UserMessage>{value}</UserMessage>
            }
          ])

          // Submit and get response message
          const responseMessage = await submitUserMessage(value)
          setMessages((currentMessages: any) => [
            ...currentMessages,
            responseMessage
          ])
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ y: 10, opacity: 0, width: '10%' }}
            animate={{ y: 0, opacity: 1, width: '66.67%' }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative p-1 flex max-h-60 shrink flex-row justify-between rounded-md overflow-hidden sm:rounded-md border align-middle"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  onClick={e => setVoiceMode(false)}
                  className="mr-2 bg-slate-500 hover:bg-slate-200"
                >
                  <EarOff />
                  <span className="sr-only">Cancel Recording</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cancel Recording</TooltipContent>
            </Tooltip>
            <div className="flex flex-row align-middle font-medium justify-between w-8/9">
              <span>
                <DotIcon size={30} strokeWidth={5} color="red" />
              </span>
              <span className=" align-baseline self-baseline pt-1 text-base">
                {vad.listening ? 'Listening ...' : 'Initializing...'}
              </span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="icon"
                  className=" bg-green-400 hover:bg-green-200"
                  onClick={() => setVoiceMode(true)}
                >
                  <CircleCheck />
                  <span className="sr-only">Speak With Ava</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Speak With Ava</TooltipContent>
            </Tooltip>
          </motion.div>
        </AnimatePresence>
      </form>
    )
  }

  console.log(text, listening, vad);

  return (
    <>
      {voiceMode ? (
        <VoiceForm />
      ) : (
        <ChatForm
          formRef={formRef}
          setInput={setInput}
          input={input}
          setMessages={setMessages}
        />
      )}
    </>
  )
}
