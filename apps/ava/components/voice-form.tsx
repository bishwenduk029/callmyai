// components/VoiceForm.tsx

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ClipLoader } from 'react-spinners'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { CircleCheck, EarOff, DotIcon } from 'lucide-react'

export function VoiceForm({
  vad,
  text,
  formRef,
  setMessages,
  submitUserMessage,
  onCancel,
  isTranscribing
}: any) {
  return (
    <form
      className="text-black border-neutral-200 flex align-middle justify-center w-fill"
      ref={formRef}
      onSubmit={async (e: any) => {
        e.preventDefault()

        // Blur focus on mobile
        if (window.innerWidth < 600) {
          e.target['message']?.blur()
        }

        const value = (
          text ||
          'Summarize this for me: Life is a battleground that I need to win on a daily basis'
        ).trim()
        // if (!value) return

        // Optimistically add user message UI

        // Submit and get response message
        const responseMessage = await submitUserMessage(value)
        setMessages((currentMessages: any) => [
          ...currentMessages,
          responseMessage
        ])
        onCancel()
        vad.pause()
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ y: 10, opacity: 0, width: '10%' }}
          animate={{ y: 0, opacity: 1, width: '100%' }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="relative flex shrink flex-row justify-between rounded-md overflow-hidden sm:rounded-md border align-middle bg-white"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={'default'}
                size="icon"
                onClick={e => {
                  e.preventDefault()
                  vad.pause()
                  onCancel()
                }}
                className="mr-2 bg-slate-200 hover:bg-slate-200"
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
                variant={'default'}
                type="submit"
                size="icon"
                disabled={isTranscribing}
                className=" bg-green-200 hover:bg-green-200"
                onClick={() => onCancel()}
              >
                {isTranscribing ? <ClipLoader size={5} /> : <CircleCheck />}
                <span className="sr-only">Done Recording</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Done Recording</TooltipContent>
          </Tooltip>
        </motion.div>
      </AnimatePresence>
    </form>
  )
}
