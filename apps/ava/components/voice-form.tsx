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
  setVoiceMode,
  isTranscribing
}: any) {
  return (
    <form
      className="bg-white text-black border-neutral-200 flex align-middle justify-center"
      ref={formRef}
      onSubmit={async (e: any) => {
        console.log('O am here')
        e.preventDefault()

        // Blur focus on mobile
        if (window.innerWidth < 600) {
          e.target['message']?.blur()
        }

        const value = text.trim() || "make a note that life will get easier from here. I am the best. I can do whatever I can do. I feel the best for some more life. I'm thankful."
        // if (!value) return

        // Optimistically add user message UI

        // Submit and get response message
        const responseMessage = await submitUserMessage(value)
        setMessages((currentMessages: any) => [
          ...currentMessages,
          responseMessage
        ])
        setVoiceMode(false)
        vad.pause()
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
                onClick={e => {
                  e.preventDefault()
                  vad.pause()
                  setVoiceMode(false)
                }}
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
                {isTranscribing ? <ClipLoader /> : <CircleCheck />}
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
