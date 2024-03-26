export async function elevenlabs(
  message: string,
  voiceId: string = '21m00Tcm4TlvDq8ikWAM',
  userPreference?: string
) {
  const apiKey = process.env.TTS_ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error('Invalid ElevenLabs API Key')
  }

  // const voices = await getElevenLabsVoices()
  // const voice = voices.filter((voice: any) => {
  //   console.log(voice.voiceName.toLowerCase(), voiceId.toLowerCase())
  //   return voice.voiceName.toLowerCase() == voiceId.toLowerCase()
  // })[0]

  // Request body
  const body = {
    text: message,
    model_id: 'eleven_turbo_v2',
    voice_settings: {
      stability: 0,
      similarity_boost: 0,
      style: 0,
      use_speaker_boost: true
    }
  }

  const elevenlabsRes = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=0&output_format=mp3_44100_128`,
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
        'xi-api-key': apiKey
      }
    }
  )

  if (!elevenlabsRes.ok) {
    const error = await elevenlabsRes.json()
    console.log(error)
    throw new Error(`ElevenLabs API Error (${elevenlabsRes.status})`)
  }
  const data = (await elevenlabsRes.arrayBuffer()) as any
  const audio = { media: 'audio/mpeg', data }
  return audio
}

export async function getElevenLabsVoices() {
  const apiKey = process.env.TTS_ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error('Invalid ElevenLabs API Key')
  }

  const options = {
    method: 'GET',
    headers: { 'xi-api-key': apiKey }
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', options)
    const data = await response.json()
    const transformedVoices = data.voices.map(
      (voice: { voice_id: any; name: any; preview_url: any; labels: any }) => ({
        voiceId: voice.voice_id,
        voiceName: voice.name,
        previewUrl: voice.preview_url,
        labels: JSON.stringify(voice.labels)
      })
    )

    return transformedVoices
  } catch (err) {
    console.error(err)
    return []
  }
}
