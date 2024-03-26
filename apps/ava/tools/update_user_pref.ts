import prisma from '@/lib/prisma'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const updateUserPreferences = new DynamicStructuredTool({
  name: 'update-user-preference',
  description:
    'From current conversation, try to understand if there is a need to update the user preference and accordingly call this function. Updates user preferences',
  schema: z.object({
    assistantId: z.string().describe('The ID of the assistant'),
    preference: z
      .string()
      .describe(
        'A complete sentence clearly expressing the new user preference'
      )
  }),
  func: async ({ assistantId = '2', preference }) => {
    try {
      const oldPreference = await prisma.userPreference.findFirst({
        where: {
          assistant_id: '2'
        }
      })

      const messages = [
        {
          name: '1',
          role: 'system',
          content: `You are an expert at coming up with a new user preference, given the old and new preference. The new preference is below:\n ${preference}\n and old preference is below:\n ${oldPreference?.preference}.\nHere are some examples of merging user preferences:\n- Old preference:\n  - User prefers to call me Alice.\n  - User prefers that I use the voice of 'EN-US'.\n  - User prefers to be called Mr. Anderson.\n  - User prefers to be cheered up with fun facts or light-hearted information.\n- New preference:\n  - User prefers to call me Nova.\n\n- Updated preference:\n  - User prefers to call me Nova.\n  - User prefers that I use the voice of 'EN-US'.\n  - User prefers to be called Mr. Anderson.\n  - User prefers to be cheered up with fun facts or light-hearted information.\n\nYou should merge the old and new preferences accordingly.`
        },
        {
          name: '2',
          role: 'assistant',
          content:
            'Give me the updated preference, by merging the old preference with new preference, resulting in adding new bullet points, or removing existing one, or updating an existing bullet point.'
        }
      ]

      const result = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        // @ts-ignore
        messages,
        stream: false,
        temperature: 0.2
      })

      await prisma.userPreference.update({
        where: {
          id: oldPreference?.id
        },
        data: {
          preference: result.choices[0].message.content
        }
      })

      return 'User preference updated successfully'
    } catch (error) {
      console.error('Failed to update user preference:', error)
      throw error
    }
  }
})
