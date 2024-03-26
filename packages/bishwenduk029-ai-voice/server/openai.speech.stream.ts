import { OpenAIProvider } from "./openai.provider";
import { SpeechResponseStreamer } from "./speech-response.streamer";

export class OpenAIStreamingSpeechResponse extends Response {
  constructor(
    textStream: ReadableStream<any>,
    voice: string,
    apiKey: string,
    apiURL?: string,
    init?: ResponseInit
  ) {
    const provider = new OpenAIProvider(apiKey, apiURL, voice);
    const streamer = new SpeechResponseStreamer();
    const speechStream = streamer.streamSpeechResponse(provider, textStream);

    super(speechStream as any, {
      ...init,
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        ...init?.headers,
      },
    });
  }
}
