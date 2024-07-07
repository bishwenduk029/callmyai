import { streamSpeech } from "../core/generate-speech/stream-speech";
import { deepgramSpeech } from "../deepgram/deepgram-provider";
import { elevenlabsSpeech } from "../elevenlabs/elevenlabs-provider";
import { playhtSpeech } from "../playht/playht-provider";
import { openaiSpeech, createOpenAI } from "../openai/openai-provider";
// import { cartesiaSpeech } from "../cartesia/cartesia-provider";

export {
  streamSpeech,
  deepgramSpeech,
  elevenlabsSpeech,
  playhtSpeech,
  openaiSpeech,
  // cartesiaSpeech,
  createOpenAI,
};
