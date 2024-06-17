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
import { SimpleTask, Task } from './task'
import IntroText from './intro-text'
import Info from './info'
import { PartialTaskSchema } from '@/lib/chat/actions'
import { useMediaQuery } from '@/lib/hooks/use-media-query'

const simpleMessages = [
  {
    content:
      'Design the homepage layout with an emphasis on user accessibility and modern UI standards. Ensure responsiveness across all devices.',
    tags: 'design, UI, accessibility, responsiveness',
    category: 'Web Development'
  },
  {
    content:
      'Fix bug in user login feature caused by incorrect session handling. Ensure all edge cases are covered and improve the security measures.',
    tags: 'bugfix, backend, security',
    category: 'Web Development'
  },
  {
    content:
      'Write comprehensive unit tests for the payment gateway integration to ensure all transactions are processed correctly. Include edge cases and error handling.',
    tags: 'testing, backend, unit tests',
    category: 'Quality Assurance'
  },
  {
    content:
      'Update API documentation to reflect recent changes in endpoints and data structures. Ensure clarity and completeness for external developers.',
    tags: 'documentation, API, writing',
    category: 'Technical Writing'
  },
  {
    content:
      'Conduct user interviews to gather feedback on the new dashboard design. Summarize key findings and suggest improvements based on user input.',
    tags: 'user research, UX, feedback',
    category: 'User Experience'
  },
  {
    content:
      'Implement dark mode feature that dynamically adjusts the theme based on user preferences and system settings. Ensure smooth transitions and UI consistency.',
    tags: 'frontend, UI, dark mode, theme',
    category: 'Web Development'
  },
  {
    content:
      'Optimize complex database queries that are causing performance issues during peak hours. Index the necessary fields and rewrite queries for efficiency.',
    tags: 'performance, backend, database, optimization',
    category: 'Database Management'
  },
  {
    content:
      'Create wireframes for the new feature that align with the overall product vision. Include detailed annotations for interactions and transitions.',
    tags: 'design, wireframing, product',
    category: 'Product Design'
  },
  {
    content:
      "Develop the mobile app splash screen with animations and brand elements. Ensure the design is engaging and conforms to the app's visual identity.",
    tags: 'mobile, UI, animations, branding',
    category: 'Mobile Development'
  },
  {
    content:
      'Set up a CI/CD pipeline to automate the build, test, and deployment processes. Integrate with existing tools and ensure robust error handling.',
    tags: 'DevOps, CI/CD, automation, integration',
    category: 'Infrastructure'
  },
  {
    content:
      'Migrate legacy codebase from JavaScript to TypeScript to improve type safety and maintainability. Refactor existing components to take advantage of TypeScript features.',
    tags: 'migration, TypeScript, refactoring, codebase',
    category: 'Web Development'
  },
  {
    content:
      'Create comprehensive marketing materials for the upcoming product launch, including brochures, social media posts, and email campaigns. Highlight key features and benefits.',
    tags: 'marketing, launch, materials, campaigns',
    category: 'Marketing'
  },
  {
    content:
      'Analyze user behavior using analytics tools to identify patterns and areas for improvement. Generate reports and provide actionable insights for the product team.',
    tags: 'analytics, UX, behavior, insights',
    category: 'User Experience'
  },
  {
    content:
      'Prepare a detailed presentation for the upcoming stakeholder meeting. Include project updates, timelines, and key performance metrics.',
    tags: 'presentation, stakeholders, updates, metrics',
    category: 'Business'
  },
  {
    content:
      'Set up A/B testing for different homepage variations to determine which design leads to higher user engagement. Analyze the results and make data-driven decisions.',
    tags: 'A/B testing, frontend, design, data',
    category: 'Web Development'
  }
]

export type InitialMessage = {
  title: string | null;
  id: string;
  content: string;
  userId: string;
  category: string;
  tags: (string | null | undefined)[];
};

export type InitialMessages = InitialMessage[];

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages: InitialMessages | never[]
}

export function UserBoard({ className, initialMessages }: ChatProps) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [messages] = useUIState()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  useEffect(() => {
    router.refresh()
  }, [router])

  return (
    <div
      className="group z-0 w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
    >
      {messages.length + initialMessages.length == 0 && (
        <div className='flex flex-col justify-center align-middle'>
          <IntroText />
          {!isDesktop && <Info />}
        </div>
      )}
      <div
        className={cn(
          'pb-[200px] pt-4 md:pt-10 px-4 sm:px-1 flex flex-col space-y-3 w-full md:w-2/5 mx-auto',
          className
        )}
      >
        <AnimatePresence>
          {messages.map((message: any) => (
            <UserTask key={message.id} message={message} />
          ))}
          {initialMessages.map((simpleMessage, index) => (
            <SimpleTask
              key={index}
              category={simpleMessage.category}
              content={simpleMessage?.content}
              tags={simpleMessage.tags}
            />
          ))}
        </AnimatePresence>
        <div className="w-full h-px" />
      </div>
      <ChatPanel
        input={input}
        setInput={setInput}
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
      className="mb-4 grid grid-cols-[25px_1fr] items-start p-4 last:mb-0 last:pb-0 border-black border-2 rounded-lg bg-background"
    >
      {message.display}
    </motion.div>
  )
}
