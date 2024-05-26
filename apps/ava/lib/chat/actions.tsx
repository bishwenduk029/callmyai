import {
  createAI,
  createStreamableUI,
  createStreamableValue,
  StreamableValue
} from 'ai/rsc'

import { z } from 'zod'
import { CoreMessage, DeepPartial, streamObject } from 'ai'
import { Task } from '@/components/task'
import { nanoid } from 'nanoid'
import { openai } from '@ai-sdk/openai'

const systemPrompt = `You are a personal and organizational assistant.

If an instruction is provided, abide by it while reformatting; if not then reformat the content to the best of your ability. Ensure to not loose the meaning while reformatting.
After reformatting, categorize the content based on its context and add appropriate tags. Send back a JSON response.

Your response should be formatted as follows:

{
  "content": "<re-purposed content>",
  "tags": "<appropriate tags>",
  "category": "<assigned category>"
}

Examples:

**Instruction and Content:**

"Make a note: Remind me to call the plumber tomorrow."

**Response:**

{
  "content": "Need to call the plumber tomorrow.",
  "tags": "call, plumber, tomorrow",
  "category": "Reminder"
}

**Instruction and Content:**

"Summarize this: Life is full of surprises and you never know what to expect next, which makes it both exciting and challenging."

**Response:**

{
  "content": "Life is unpredictable, making it both exciting and challenging.",
  "tags": "life, surprises, unpredictable",
  "category": "Summary"
}

**Content:**

"Research task: Need to research about quantum computing."

**Response:**

{
  "content": "Need to research about quantum computing.",
  "tags": "research, quantum computing",
  "category": "Task"
}

**Content:**

"Idea: I think I should start a blog about my travel experiences."

**Response:**

{
  "content": "I should start a blog about my travel experiences.",
  "tags": "blog, travel experiences",
  "category": "Idea"
}

**Instruction and Content:**
"Summarize this, Life is full of surprizes and I am just beginning to explore the world."

**Response:**

{
  "content": "Exploring the world reveals life's many surprises.",
  "tags": "blog, travel experiences",
  "category": "Idea"
}

Use this prompt to ensure the content is categorized and labeled correctly while automatically repurposing or reformatting the content as needed.`;


export const taskSchema = z.object({
  content: z.string(),
  tags: z.string(),
  category: z.string()
})

export type PartialTaskSchema = DeepPartial<typeof taskSchema>
export type TaskSchema = z.infer<typeof taskSchema>

async function submitUserMessage(userContent: string) {
  'use server'

  const uiStream = createStreamableUI()

  const objectStream = createStreamableValue<PartialTaskSchema>()

  uiStream.append(<Task task={objectStream.value} />)
  const messages: CoreMessage[] = [
    {
      role: 'user',
      content: userContent
    }
  ]

  await streamObject({
    model: openai.chat('gpt-4o'),
    system: systemPrompt,
    messages,
    maxRetries: 0,
    mode: 'json',
    schema: z.object({
      content: z.string(),
      tags: z.string(),
      category: z.string()
    })
  })
    .then(async result => {
      for await (const obj of result.partialObjectStream) {
        if (Object.keys(obj).length !== 0) {
          objectStream.update(obj)
        }
      }
    })
    .finally(() => {
      objectStream.done()
      uiStream.done()
    })

  return {
    id: nanoid(),
    display: uiStream.value
  }
}

export type UIState = {
  id: string
  display: React.ReactNode | Iterable<React.ReactNode> | JSX.Element
  isGenerating?: StreamableValue<boolean>
}[]

export const AI = createAI<null, UIState>({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: null
})
