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
import { AutosizeTextarea } from './ui/autosize-textarea'

export function ChatForm({
  vad,
  setInput,
  input,
  setMessages,
}: any) {
    const { submitUserMessage } = useActions()
    const { formRef, onKeyDown } = useEnterSubmit()
  return (
    <form
      className="text-black dark:text-white bg-white"
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
      <div className="relative flex max-h-560 sm:w-full grow flex-row overflow-hidden sm:rounded-md">
        <AutosizeTextarea
          placeholder={"Make a note of ...."}
          onKeyDown={onKeyDown}
          onChange={e => setInput(e.target.value)}
        />

        <div className="absolute right-0 top-[20px] sm:right-4 flex-row justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                size="icon"
                disabled={input === ''}
                className="p-1"
              >
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}
