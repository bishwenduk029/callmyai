import { elevenlabs, getElevenLabsVoices } from './elevenlabs'
import { getNeetsAiVoices, neetsai } from './neetsai'
import { OpenAITTS, getOpenAIVoices } from './openai'
import { textStreamToSentences } from './textStreamToSentenceStream'

export async function toSpeech(text: string, voice?: string) {
  try {
    switch (process.env.TTS_BACKEND) {
      case 'none': {
        return null
      }
      case 'neetsai-tts': {
        const audio = await neetsai(text, voice)
        return audio
      }
      case 'elevenlabs-tts': {
        const audio = await elevenlabs(text, voice)
        return audio
      }
      case 'openai_tts': {
        const audio = await OpenAITTS(text, voice)
        return audio
      }
    }
  } catch (e: any) {
    console.error(e.toString())
  }
}

export async function toStreamingSpeech(
  textStream: ReadableStream<any>,
  voiceID: string
) {
  const sentenceStream = textStreamToSentences(textStream)
  const reader = sentenceStream.getReader()

  const outStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      async function readSentenceChunk() {
        const { done, value } = await reader.read()

        if (done) {
          controller.close()
          return
        }

        const audioStream = await OpenAITTS(value, voiceID)
        const audioReader = audioStream.getReader()

        while (true) {
          const { done: audioDone, value: audioValue } =
            await audioReader.read()
          if (audioDone) {
            readSentenceChunk()
            break
          }
          controller.enqueue(audioValue)
        }
      }

      readSentenceChunk()
    }
  })
  
  return new Response(outStream, {
    status: 200,
    headers: { 'Content-Type': 'audio/mpeg' }
  })
}

export async function getVoices() {
  try {
    switch (process.env.TTS_BACKEND) {
      case 'none': {
        return null
      }
      case 'elevenlabs-tts': {
        const voices = await getElevenLabsVoices()
        return voices
      }

      case 'neetsai-tts': {
        const voices = await getNeetsAiVoices()
        return voices
      }
      case 'openai_tts': {
        const audio = await getOpenAIVoices()
        return audio
      }
    }
  } catch (e: any) {
    console.error(e.toString())
  }
}
