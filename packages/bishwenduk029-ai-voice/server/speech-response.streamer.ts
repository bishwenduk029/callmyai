import { SpeechProvider } from "./base.provider";
import { textStreamToSentences } from "./text-to-sentence-stream";

export class SpeechResponseStreamer {
  streamSpeechResponse(
    provider: SpeechProvider,
    textStream: ReadableStream<any>
  ): ReadableStream<Uint8Array> {
    const sentenceStream = textStreamToSentences(textStream);
    const reader = sentenceStream.getReader();

    const outStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        async function readSentenceChunk() {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }

          const audioStream = await provider.getAudioStream(value);
          const audioReader = audioStream.getReader();

          while (true) {
            const { done: audioDone, value: audioValue } =
              await audioReader.read();
            if (audioDone) {
              readSentenceChunk();
              break;
            }
            controller.enqueue(audioValue);
          }
        }

        readSentenceChunk();
      },
    });

    return outStream;
  }
}
