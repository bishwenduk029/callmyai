import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

export const robot = new DynamicStructuredTool({
  name: 'desktop-robot',
  description:
    'This tool helps in typing or writing any text or strings on any desktop app that the user has currently placed the cursor on. Use this if you have to type or write any text or string',
  schema: z.object({
    textToType: z.string().describe('The text or string to type or write')
  }),
  // @ts-ignore
  func: async ({ textToType }) => {
    if (!textToType) {
      return 'Error did not work, as this tool was called without the text to type'
    }
    try {
      const response = await fetch('http://localhost:3001/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: textToType })
      })

      if (response.ok) {
        const message = await response.text()
        console.log(message)
        return message
      } else {
        console.error(`Server responded with status code: ${response.status}`)
        return response.status
      }
    } catch (error) {
      console.error('Error sending request:', error)
      return error
    }
  }
})
