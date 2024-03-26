const defaults = {
  language: 'en',
  openai_url: process.env.OPENAI_API_URL ?? 'https://api.openai.com',
  openai_model: process.env.OPENAI_MODEL ?? 'gpt-3.5-turbo',
  openai_key: process.env.OPENAI_API_KEY,
  tts_muted: process.env.NEXT_PUBLIC_TTS_MUTED ?? 'false',
  tts_backend: process.env.TTS_BACKEND ?? 'none',
  elevenlabs_apikey: process.env.TTS_ELEVENLABS_API_KEY ?? '',
  elevenlabs_voiceid: process.env.TTS_ELEVENLABS_VOICEID,
  elevenlabs_model: process.env.TTS_ELEVENLABS_MODELID,
  neetsai_apikey: process.env.TTS_NEETSAI_API_KEY ?? '',
  neetsai_voiceid: process.env.TTS_NEETSAI_VOICEID,
  neetsai_model: process.env.TTS_NEETSAI_MODELID,
  name: process.env.NEXT_PUBLIC_NAME ?? 'Ava',
  speech_to_text_to_speech_url: process.env.OPENAI_SPEECH_TO_TEXT_TO_SPEECH_URL,
  perplexity_api_key: process.env.PERPLEXITY_API_KEY,
  ava_agent_mode: process.env.NEXT_PUBLIC_AVA_AGENT_MODE
}

export function config(key: string): string {
  if (defaults.hasOwnProperty(key)) {
    return (<any>defaults)[key]
  }

  throw new Error(`config key not found: ${key}`)
}
