import 'server-only'

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'

import { z } from 'zod'
import { CoreMessage, DeepPartial, generateObject, streamObject } from 'ai'
import { Task } from '@/components/task'
import { nanoid } from 'nanoid'
import { ollama } from 'ollama-ai-provider';

export const taskSchema = z.object({
  content: z.string(),
  tags: z.string(),
  category: z.string()
})

export type PartialTaskSchema = DeepPartial<typeof taskSchema>
export type TaskSchema = z.infer<typeof taskSchema>

async function submitUserMessage(userContent: string) {
  'use server'
  console.log('I am here now', userContent)

  const objectStream = createStreamableValue<PartialTaskSchema>()
  const messages: CoreMessage[] = [
    {
      role: 'user',
      content: userContent
    }
  ]

  console.log(messages)
  const result = await generateObject({
    model: ollama('llama3:latest'),
    system: `You are an organizational assistant. Given a piece of content, you need to 
    categorize and label it appropriately. Create your own categories based on the 
    content and return a JSON response with the original content, appropriate tags, and 
    the assigned category. Re-purpose the content to be suitable note , task or anthing else without loosing the meaning.

    Your response should be formatted as follows:

    "{
      "content": "<re-purposed content>",
      "tags": "<appropriate tags>",
      "category": "<assigned category>"
    }"

    Examples:

    **Content:**

    "Remind me to call the plumber tomorrow."

    **Response:**

    "{
      "content": "Need to call the plumber tomorrow.",
      "tags": "call, plumber, tomorrow",
      "category": "Reminder"
    }"

    **Content:**

    "Need to research about quantum computing."

    **Response:**

    "{
      "content": "Need to research about quantum computing.",
      "tags": "research, quantum computing",
      "category": "Task"
    }"

    **Content:**

    "I think I should start a blog about my travel experiences."

    **Response:**

    "{
      "content": "I should start a blog about my travel experiences.",
      "tags": "blog, travel experiences",
      "category": "Idea"
    }"

    Use this prompt to ensure the content is categorized and labeled correctly.`,
    messages,
    schema: z.object({
      content: z.string(),
      tags: z.string(),
      category: z.string()
    }),
  })

  const { content, tags, category } = result.object

  return {
    id: nanoid(),
    display: <Task content={content} tags={tags} category={category} />
  }
}

export type UIState = {
  id: string
  display: React.ReactNode | Iterable<React.ReactNode>
}[]

export const AI = createAI<null, UIState>({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: null
})
