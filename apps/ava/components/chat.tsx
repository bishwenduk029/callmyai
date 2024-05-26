'use client'

import { cn } from '@/lib/utils'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import {
  JSXElementConstructor,
  PromiseLikeOfReactNode,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState
} from 'react'
import { useUIState, useAIState, useStreamableValue } from 'ai/rsc'
import { Message, Session } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import { AnimatedList } from './ui/animated-list'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from './ui/skeleton'
import { messages } from '../lib/db/schema'
import { SimpleTask, Task } from './task'

const simpleMessages = [
  {
    "content": "Design the homepage layout with an emphasis on user accessibility and modern UI standards. Ensure responsiveness across all devices.",
    "tags": "design, UI, accessibility, responsiveness",
    "category": "Web Development"
  },
  {
    "content": "Fix bug in user login feature caused by incorrect session handling. Ensure all edge cases are covered and improve the security measures.",
    "tags": "bugfix, backend, security",
    "category": "Web Development"
  },
  {
    "content": "Write comprehensive unit tests for the payment gateway integration to ensure all transactions are processed correctly. Include edge cases and error handling.",
    "tags": "testing, backend, unit tests",
    "category": "Quality Assurance"
  },
  {
    "content": "Update API documentation to reflect recent changes in endpoints and data structures. Ensure clarity and completeness for external developers.",
    "tags": "documentation, API, writing",
    "category": "Technical Writing"
  },
  {
    "content": "Conduct user interviews to gather feedback on the new dashboard design. Summarize key findings and suggest improvements based on user input.",
    "tags": "user research, UX, feedback",
    "category": "User Experience"
  },
  {
    "content": "Implement dark mode feature that dynamically adjusts the theme based on user preferences and system settings. Ensure smooth transitions and UI consistency.",
    "tags": "frontend, UI, dark mode, theme",
    "category": "Web Development"
  },
  {
    "content": "Optimize complex database queries that are causing performance issues during peak hours. Index the necessary fields and rewrite queries for efficiency.",
    "tags": "performance, backend, database, optimization",
    "category": "Database Management"
  },
  {
    "content": "Create wireframes for the new feature that align with the overall product vision. Include detailed annotations for interactions and transitions.",
    "tags": "design, wireframing, product",
    "category": "Product Design"
  },
  {
    "content": "Develop the mobile app splash screen with animations and brand elements. Ensure the design is engaging and conforms to the app's visual identity.",
    "tags": "mobile, UI, animations, branding",
    "category": "Mobile Development"
  },
  {
    "content": "Set up a CI/CD pipeline to automate the build, test, and deployment processes. Integrate with existing tools and ensure robust error handling.",
    "tags": "DevOps, CI/CD, automation, integration",
    "category": "Infrastructure"
  },
  {
    "content": "Migrate legacy codebase from JavaScript to TypeScript to improve type safety and maintainability. Refactor existing components to take advantage of TypeScript features.",
    "tags": "migration, TypeScript, refactoring, codebase",
    "category": "Web Development"
  },
  {
    "content": "Create comprehensive marketing materials for the upcoming product launch, including brochures, social media posts, and email campaigns. Highlight key features and benefits.",
    "tags": "marketing, launch, materials, campaigns",
    "category": "Marketing"
  },
  {
    "content": "Analyze user behavior using analytics tools to identify patterns and areas for improvement. Generate reports and provide actionable insights for the product team.",
    "tags": "analytics, UX, behavior, insights",
    "category": "User Experience"
  },
  {
    "content": "Prepare a detailed presentation for the upcoming stakeholder meeting. Include project updates, timelines, and key performance metrics.",
    "tags": "presentation, stakeholders, updates, metrics",
    "category": "Business"
  },
  {
    "content": "Set up A/B testing for different homepage variations to determine which design leads to higher user engagement. Analyze the results and make data-driven decisions.",
    "tags": "A/B testing, frontend, design, data",
    "category": "Web Development"
  }
]


export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  session?: Session
  missingKeys: string[]
}

export function Chat({ id, className, session, missingKeys }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [input, setInput] = useState('')
  const [messages] = useUIState()
  const [aiState] = useAIState()

  const [_, setNewChatId] = useLocalStorage('newChatId', id)

  useEffect(() => {
    if (session?.user) {
      if (!path.includes('chat') && messages.length === 1) {
        window.history.replaceState({}, '', `/chat/${id}`)
      }
    }
  }, [id, path, session?.user, messages])

  useEffect(() => {
    router.refresh()
  }, [router])

  useEffect(() => {
    setNewChatId(id)
  })

  useEffect(() => {
    missingKeys.map(key => {
      toast.error(`Missing ${key} environment variable!`)
    })
  }, [missingKeys])

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()

  console.log(messages)

  return (
    <div
      className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
      ref={scrollRef}
    >
      <div
        className={cn(
          'pb-[200px] pt-4 md:pt-10 px-4 sm:px-1 flex flex-col space-y-8 sm:w-1/2 mx-auto',
          className
        )}
        ref={messagesRef}
      >
        <AnimatePresence>
          {messages.map((message: any) => (
            <UserTask key={message.id} message={message} />
          ))}
          {simpleMessages.map((simpleMessage, index) => (<SimpleTask key={index} task={simpleMessage} />))}
        </AnimatePresence>
        <div className="w-full h-px" ref={visibilityRef} />
      </div>
      <ChatPanel
        id={id}
        input={input}
        setInput={setInput}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />
    </div>
  )
}

const UserTask = ({
  message
}: {
  message: {
    id: any
    display:
      | string
      | number
      | boolean
      | ReactElement<any, string | JSXElementConstructor<any>>
      | Iterable<ReactNode>
      | ReactPortal
      | PromiseLikeOfReactNode
      | ReactNode
      | null
      | undefined
    isGenerating: boolean
  }
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      key={`${message.id}`}
    >
      {message.display}
    </motion.div>
  )
}
