import { DeepgramProvider } from "./deepgram.provider";
import { SpeechResponseStreamer } from "./speech-response.streamer";

export class DeepgramStreamingSpeechResponse extends Response {
  constructor(
    textStream: ReadableStream<any>,
    apiKey: string,
    voiceID?: string,
    init?: ResponseInit
  ) {
    const provider = new DeepgramProvider(apiKey, voiceID);
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
