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

  return <PromptForm input={input} setInput={setInput} />
}
