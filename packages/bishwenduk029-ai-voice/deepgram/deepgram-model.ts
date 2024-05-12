import { textStreamToSentences } from "../core/text-to-sentence-stream";
import { DeepgramSpeechModelId } from "./deepgram-speech-settings";
import { deepgramSpeechFailedResponseHandler } from "./deepgram-error";
import {
  postJsonToApi,
} from "@ai-sdk/provider-utils";
import { createSpeechResponseHandler } from "../server/utils/create-speech-response-handler";
import { SpeechModelV1 } from "../core/provider/speech-model-v1";

type DeepgramSpeechConfig = {
  provider: string;
  baseURL: string;
  headers: () => Record<string, string | undefined>;
  generateId: () => string;
};

export class DeepgramSpeechModel implements SpeechModelV1 {
  readonly specificationVersion = "v1";

  readonly modelId: DeepgramSpeechModelId;

  private readonly config: DeepgramSpeechConfig;

  constructor(modelId: DeepgramSpeechModelId, config: DeepgramSpeechConfig) {
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
    console.log(this.config.headers())
    const { responseHeaders, value: response } = await postJsonToApi({
      url: `${this.config.baseURL}/v1/speak?model=${this.modelId}`,
      headers: this.config.headers(),
      body: {
        text: value,
      },
      successfulResponseHandler: createSpeechResponseHandler<Uint8Array>(),
      failedResponseHandler: deepgramSpeechFailedResponseHandler,
      abortSignal: undefined,
    });

    return response;
  }
}
