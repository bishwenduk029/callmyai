import * as React from 'react'

import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconShare } from '@/components/ui/icons'
import { FooterText } from '@/components/footer'
import { ChatShareDialog } from '@/components/chat-share-dialog'
import { useAIState, useActions, useUIState } from 'ai/rsc'
import type { AI } from '@/lib/chat/actions'
import { AnimatePresence, motion } from 'framer-motion'

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, bottom: -10 },
  show: { opacity: 1, bottom: 4, transition: { type: 'spring' } }
}

export interface ChatPanelProps {
  title?: string
  input: string
  setInput: (value: string) => void
}

export function ChatPanel({ title, input, setInput }: ChatPanelProps) {
  const [aiState] = useAIState()
  const [messages, setMessages] = useUIState<typeof AI>()
  const { submitUserMessage } = useActions()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }} // Image starts from 100px below and fully transparent
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="fixed inset-x-0 bottom-4 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px] rounded-lg"
      >
        <div className="mx-auto sm:max-w-4xl sm:px-4">
          {messages?.length >= 2 ? (
            <div className="flex h-12 items-center justify-center  bg-white">
              <div className="flex space-x-2">
                {title ? (
                  <>
                    <Button variant="outline">
                      <IconShare className="mr-2" />
                      Share
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}

          <PromptForm input={input} setInput={setInput} />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
