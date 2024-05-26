// components/ChatForm.tsx

import * as React from 'react'
import { nanoid } from 'nanoid'
import { Button } from '@/components/ui/button'
import { IconArrowElbow, IconMic } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholder-and-vanish-input'
import { useActions } from 'ai/rsc'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'

export function ChatForm({
  vad,
  setInput,
  input,
  setMessages,
  placeholders,
  setVoiceMode
}: any) {
    const { submitUserMessage } = useActions()
    const { formRef, onKeyDown } = useEnterSubmit()
  return (
    <form
      className="text-black dark:text-white"
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

        // Submit and get response message
        const responseMessage = await submitUserMessage(value)
        setMessages((currentMessages: any) => [
          ...currentMessages,
          responseMessage
        ])
      }}
    >
      <div className="relative flex max-h-60 w-full grow flex-row overflow-hidden px-4 sm:rounded-md sm:px-6">
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onKeyDown={onKeyDown}
          onChange={e => setInput(e.target.value)}
        />

        <div className="absolute right-0 top-[13px] sm:right-4 flex-row justify-center">
          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                size="lg"
                disabled={input === ''}
                className="mr-2 p-4"
              >
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip> */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                className="p-5 flex flex-row space-x-2"
                onClick={e => {
                  e.preventDefault()
                  setVoiceMode(true)
                }}
              >
                <IconMic className=' text-orange-600' />
                <span className="hidden text-lg sm:inline">Record</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Speak With Ava</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}
