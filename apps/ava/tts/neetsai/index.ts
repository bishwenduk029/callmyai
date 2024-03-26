import { config } from '@/lib/config'

export async function neetsai(
  message: string,
  voiceId: string = config('neetsai_voiceid'),
  userPreference?: string
) {
  const apiKey = config('neetsai_apikey')
  console.log(apiKey)
  if (!apiKey) {
    throw new Error('Invalid NeetsAI API Key')
  }

  // Request body
  const body = {
    text: message,
    voice_id: voiceId,
    params: {
      model: config('neetsai_model')
    }
  }

  console.log(body)

  const response = await fetch(`https://api.neets.ai/v1/tts`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
      'X-API-Key': apiKey
    }
  })

  if (!response.ok) {
    const error = await response.json()
    console.log(error)
    throw new Error(`NeetsAI API Error (${response.status})`)
  }
  const data = (await response.arrayBuffer()) as any
  const audio = { media: 'audio/mpeg', data }
  console.log(audio)
  return audio
}

export async function getNeetsAiVoices() {
  const hardcodedStrings: string[] = [
    'us-male-1',
    'us-male-2',
    'us-male-3',
    'us-male-4',
    'us-male-5',
    'us-female-1',
    'us-female-2',
    'us-female-3',
    'us-female-4',
    'us-female-5',
    'us-female-6'
  ]

  return hardcodedStrings
}
