import { streamSpeech } from '../core/generate-speech/stream-speech';
import { deepgramSpeech } from '../deepgram/deepgram-provider';
import { elevenlabsSpeech } from '../elevenlabs/elevenlabs-provider';
import { playhtSpeech } from '../playht/playht-provider';
import { openaiSpeech, createOpenAI } from '../openai/openai-provider';

export {
  streamSpeech,
  deepgramSpeech,
  elevenlabsSpeech,
  playhtSpeech,
  openaiSpeech,
  createOpenAI
};
