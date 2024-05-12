import { DeepgramSpeechModel } from "../../deepgram/deepgram-model";
import { SpeechModelV1 } from "../provider/speech-model-v1";

type StreamFunc = (
  textStream: AsyncIterable<string>
) => Promise<ReadableStream<Uint8Array>>;

export function streamSpeech(model: SpeechModelV1): StreamFunc {
  return async function (
    textStream: AsyncIterable<string>
  ): Promise<ReadableStream<Uint8Array>> {
    return model.doStream(textStream);
  };
}
