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
import { Button, buttonVariants } from './ui/button'
import Icons, { IconClose } from './ui/icons'
import { PopoverAnchor, PopoverArrow } from '@radix-ui/react-popover'
import { Dock, DockIcon } from '@/components/magicui/dock'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import Link from 'next/link'
import { HomeIcon, NotebookIcon } from 'lucide-react'
import { cn } from '../lib/utils'
import { Separator } from './ui/separator'

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
        <DrawerTrigger asChild className="flex flex-row justify-center">
          <Dock className="z-50 bottom-5 pointer-events-auto border-6 fixed rounded-full flex items-center px-1 bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] transform-gpu">
            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/"
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'icon' }),
                      'size-12'
                    )}
                  >
                    <HomeIcon className="size-6" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Home</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>

            <Separator orientation="vertical" className="h-full py-4" />
            <DockIcon key={'record'}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={'ghost'}
                    size={'lg'}
                    onClick={() => {
                      setRecorderOpen(!recorderOpen)
                      setOpen(!open)
                      setVoiceMode(true)
                    }}
                  >
                    <Icons.IconMic className="size-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Record</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
            <DockIcon key={'write'}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={'ghost'}
                    size={'lg'}
                    onClick={() => {
                      setWriterOpen(!writerOpen)
                      setOpen(!open)
                      setVoiceMode(false)
                    }}
                  >
                    <Icons.IconFeather className="size-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Record</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
            <Separator orientation="vertical" className="h-full py-4" />
            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/blog"
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'icon' }),
                      'size-12'
                    )}
                  >
                    <NotebookIcon className="size-6" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Blog</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          </Dock>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Edit profile</DrawerTitle>
            <DrawerDescription>
              Make changes to your profile here. Click save when you're done.
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
      </Drawer>
    )
  }

  return (
    <Popover
      open={open}
      onOpenChange={open => {
        if (!open) {
          vad.pause()
        }
      }}
    >
      <div className="fixed bottom-0 inset-x-0 h-16 w-full bg-background to-transparent backdrop-blur-lg [-webkit-mask-image:linear-gradient(to_top,black,transparent)]"></div>
      <PopoverTrigger className="flex flex-row justify-center">
        <PopoverAnchor asChild>
          <Dock className="z-50 bottom-20 sm:bottom-8 pointer-events-auto border-6 fixed rounded-full flex items-center px-1 bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] transform-gpu">
            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/"
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'icon' }),
                      'size-12'
                    )}
                  >
                    <HomeIcon className="size-6" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Home</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>

            <Separator orientation="vertical" className="h-full py-4" />
            <DockIcon key={'record'}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={'ghost'}
                    size={'lg'}
                    onClick={() => {
                      setRecorderOpen(!recorderOpen)
                      setOpen(!open)
                      setVoiceMode(true)
                    }}
                  >
                    <Icons.IconMic className="size-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Record</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
            <DockIcon key={'write'}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={'ghost'}
                    size={'lg'}
                    onClick={() => {
                      setWriterOpen(!writerOpen)
                      setOpen(!open)
                      setVoiceMode(false)
                    }}
                  >
                    <Icons.IconFeather className="size-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Record</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
            <Separator orientation="vertical" className="h-full py-4" />
            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/blog"
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'icon' }),
                      'size-12'
                    )}
                  >
                    <NotebookIcon className="size-6" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Blog</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          </Dock>
        </PopoverAnchor>
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
    </Popover>
  )
}
