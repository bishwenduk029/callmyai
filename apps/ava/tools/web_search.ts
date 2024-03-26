import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import OpenAI from 'openai'

const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY || '',
  baseURL: 'https://api.perplexity.ai/'
})

export const webSearch = new DynamicStructuredTool({
  name: 'web-search',
  description:
    'Query the web for any factual information or current information',
  schema: z.object({
    query: z.string().describe('The ID of the assistant')
  }),
  // @ts-ignore
  func: 
  async ({ query }) => {
    console.log("web search was called with", query)
    try {
      const messages = [
        {
          role: 'user',
          content: query
        }
      ]

      const response = await perplexity.chat.completions.create({
        model: 'sonar-small-online',
        stream: false,
        max_tokens: 1000,
        // @ts-ignore
        messages
      })

      return response.choices[0].message.content
    } catch (error) {
      console.error('Failed to query from Perplexity:', error)
      throw error
    }
  }
})
