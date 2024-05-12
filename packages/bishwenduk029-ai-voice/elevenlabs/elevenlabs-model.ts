import { textStreamToSentences } from "../core/text-to-sentence-stream";
import { ElevenlabsSpeechModelId } from "./elevenlabs-speech-settings";
import { elevenlabsSpeechFailedResponseHandler } from "./elevenlabs-error";
import {
  postJsonToApi,
} from "@ai-sdk/provider-utils";
import { createSpeechResponseHandler } from "../server/utils/create-speech-response-handler";
import { SpeechModelV1 } from "../core/provider/speech-model-v1";

type ElevenLabsSpeechConfig = {
  provider: string;
  baseURL: string;
  voiceId: string;
  headers: () => Record<string, string | undefined>;
  generateId: () => string;
};

export class ElevenlabsSpeechModel implements SpeechModelV1 {
  readonly specificationVersion = "v1";

  readonly modelId: ElevenlabsSpeechModelId;

  private readonly config: ElevenLabsSpeechConfig;

  constructor(modelId: ElevenlabsSpeechModelId, config: ElevenLabsSpeechConfig) {
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
      url: `${this.config.baseURL}/v1/text-to-speech/${this.config.voiceId}/stream`,
      headers: this.config.headers(),
      body: {
        model_id: this.modelId,
        text: value,
      },
      successfulResponseHandler: createSpeechResponseHandler<Uint8Array>(),
      failedResponseHandler: elevenlabsSpeechFailedResponseHandler,
      abortSignal: undefined,
    });

    return response;
  }
}
