/* eslint-disable no-unused-vars */
export interface SpeechProvider {
  getAudioStream(text: string): Promise<ReadableStream>;
}
