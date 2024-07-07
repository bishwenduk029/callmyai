import { textStreamToSentences } from "../core/text-to-sentence-stream";
import { OpenAISpeechModelId } from "./openai-speech-settings";
import { platHtSpeechFailedResponseHandler } from "./openai-error";
import {
  postJsonToApi,
} from "@ai-sdk/provider-utils";
import { createSpeechResponseHandler } from "../server/utils/create-speech-response-handler";
import { SpeechModelV1 } from "../core/provider/speech-model-v1";

type OpenAISpeechConfig = {
  provider: string;
  baseURL: string;
  voiceId: string;
  headers: () => Record<string, string | undefined>;
  generateId: () => string;
};

export class OpenAISpeechModel implements SpeechModelV1 {
  readonly specificationVersion = "v1";

  readonly modelId: OpenAISpeechModelId;

  private readonly config: OpenAISpeechConfig;

  constructor(modelId: OpenAISpeechModelId, config: OpenAISpeechConfig) {
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
      url: `${this.config.baseURL}/v1/audio/speech`,
      headers: this.config.headers(),
      body: {
        input: value,
        voice: this.config.voiceId,
        model: this.modelId
      },
      successfulResponseHandler: createSpeechResponseHandler<Uint8Array>(),
      failedResponseHandler: platHtSpeechFailedResponseHandler,
      abortSignal: undefined,
    });

    return response;
  }
}
