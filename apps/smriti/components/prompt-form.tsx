// components/PromptForm.tsx

'use client'

import * as React from 'react'
import { useActions, useUIState } from 'ai/rsc'
import { useTranscription } from '@bishwenduk029/ai-voice/ui'
import { useMediaQuery } from '@/lib/hooks/use-media-query'
import { ChatForm } from './chat-form'
import { VoiceForm } from './voice-form'
import { AI } from '../lib/chat/actions'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import Icons, { IconClose } from './ui/icons'
import { Label } from '@radix-ui/react-dropdown-menu'
import { Input } from './ui/input'
import { FeatherIcon } from 'lucide-react'
import { PopoverAnchor, PopoverArrow } from '@radix-ui/react-popover'
import { motion } from 'framer-motion'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose
} from './ui/drawer'

export function PromptForm({
  input,
  setInput
}: {
  input: string
  setInput: (value: string) => void
}) {
  const [voiceMode, setVoiceMode] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')
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

  if (!isDesktop) {
    return (
      <div className="">
        <Drawer
          open={open}
          onOpenChange={open => {
            setOpen(open)
            if (!open) {
              setRecorderOpen(false)
              setWriterOpen(false)
            }
          }}
        >
          <div className="flex flex-row justify-between bg-black border-t max-w-96 mx-auto px-4 py-2 shadow-2xl shadow-purple-200 sm:rounded-2xl sm:border md:py-4">
            <DrawerTrigger asChild>
              <Button
                size="lg"
                className="p-5 flex flex-row space-x-2"
                onClick={() => {
                  setRecorderOpen(!recorderOpen)
                  setOpen(!open)
                  setVoiceMode(true)
                }}
              >
                {recorderOpen ? <Icons.IconClose /> : <Icons.IconMic className="" />}
                <span className="hidden text-lg sm:inline">
                  {recorderOpen ? 'Close' : 'Record'}
                </span>
              </Button>
            </DrawerTrigger>
            <DrawerTrigger asChild>
              <Button
                size="lg"
                className="p-5 flex flex-row space-x-2"
                onClick={() => {
                  setWriterOpen(!writerOpen)
                  setOpen(!open)
                  setVoiceMode(false)
                }}
              >
                {writerOpen ? <Icons.IconClose /> : <FeatherIcon className="" />}
                <span className="hidden text-lg sm:inline">
                  {writerOpen ? 'Close' : 'Write'}
                </span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Edit profile</DrawerTitle>
                <DrawerDescription>
                  Make changes to your profile here. Click save when you're
                  done.
                </DrawerDescription>
              </DrawerHeader>
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
                />
              )}
              <DrawerFooter className="pt-2">
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </div>
        </Drawer>
      </div>
    )
  }

  return (
    <div className="shadow-2xl shadow-orange-300 w-full mx-auto sm:rounded-2xl sm:border ">
      <Popover
        open={open}
        onOpenChange={open => {
          if (!open) {
            vad.pause()
          }
        }}
      >
        <PopoverAnchor asChild>
          <div className="flex flex-row justify-between w-full sm:mx-auto px-4 py-2 md:py-4">
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
                {recorderOpen ? <Icons.IconClose /> : <Icons.IconMic className="" />}
                <span className="hidden text-lg sm:inline">
                  {recorderOpen ? 'Close' : 'Record'}
                </span>
              </Button>
            </PopoverTrigger>
            <Icons.IconSeparator className="size-12 text-muted-foreground/50" />
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
