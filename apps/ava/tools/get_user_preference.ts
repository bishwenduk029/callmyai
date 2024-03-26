import prisma from '@/lib/prisma'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

export const getUserPreferences = new DynamicStructuredTool({
  name: 'get-user-preference',
  description: 'Get the current preference of the user for the assistant',
  schema: z.object({
    assistantId: z.string().describe('The ID of the assistant')
  }),
  // @ts-ignore
  func: async ({ assistantId = '2' }) => {
    try {
      const userPreference = await prisma.userPreference.findFirst({
        where: {
          assistant_id: "2"
        }
      })

      return userPreference ? userPreference.preference : null
    } catch (error) {
      console.error('Failed to get user preference:', error)
      throw error
    }
  }
})
