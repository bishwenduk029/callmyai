import { textStreamToSentences } from "../core/text-to-sentence-stream";
import { PlayHtSpeechModelId } from "./playht-speech-settings";
import { platHtSpeechFailedResponseHandler } from "./playht-error";
import {
  postJsonToApi,
} from "@ai-sdk/provider-utils";
import { createSpeechResponseHandler } from "../server/utils/create-speech-response-handler";
import { SpeechModelV1 } from "../core/provider/speech-model-v1";

type PlayHtSpeechConfig = {
  provider: string;
  baseURL: string;
  voiceId: string;
  headers: () => Record<string, string | undefined>;
  generateId: () => string;
};

export class PlayHtSpeechModel implements SpeechModelV1 {
  readonly specificationVersion = "v1";

  readonly modelId: PlayHtSpeechModelId;

  private readonly config: PlayHtSpeechConfig;

  constructor(modelId: PlayHtSpeechModelId, config: PlayHtSpeechConfig) {
    this.modelId = modelId;
    this.config = config;
  }

  get provider(): string {
    return this.config.provider;
  }

  async doStream(
    textStream: AsyncIterable<string>
  ): Promise<ReadableStream<Uint8Array>> {
    const sentenceStream = textStreamToSentences(textStream);

    const outStream = await this.handlReadableStream(
      sentenceStream,
      (sentence: string) => this.generateAudioStream(sentence),
    );

    return outStream;
  }

  async handlReadableStream(
    sentenceStream: ReadableStream<string>,
    generateAudioStream: (
      sentence: string
    ) => Promise<ReadableStream<Uint8Array>>
  ): Promise<ReadableStream<Uint8Array>> {
    const sentenceReader = sentenceStream.getReader();

    return new ReadableStream({
      async start(controller) {
        async function readSentence() {
          const { done, value: sentence } = await sentenceReader.read();
          if (done) {
            controller.close();
            return;
          }

          const audioReader = (await generateAudioStream(sentence)).getReader();

          while (true) {
            const { done: audioDone, value: audioValue } =
              await audioReader.read();
            if (audioDone) {
              readSentence();
              break;
            }
            controller.enqueue(audioValue);
          }
        }

        readSentence();
      },
    });
  }

  async generateAudioStream(value: string) {
    const { responseHeaders, value: response } = await postJsonToApi({
      url: `${this.config.baseURL}/api/v2/tts/stream`,
      headers: this.config.headers(),
      body: {
        text: value,
        voice: this.config.voiceId,
        voice_engine: this.modelId
      },
      successfulResponseHandler: createSpeechResponseHandler<Uint8Array>(),
      failedResponseHandler: platHtSpeechFailedResponseHandler,
      abortSignal: undefined,
    });

    return response;
  }
}
