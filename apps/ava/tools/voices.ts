import { getVoices } from '@/tts'
import { DynamicTool } from '@langchain/core/tools'

export const voices = new DynamicTool({
  name: 'get-voices',
  description: 'Get list of available voices, for user to choose from',
  func: async () => {
    console.log("Voices was called")
    const voices = await getVoices()
    console.log(voices)
    return voices
  }
})
