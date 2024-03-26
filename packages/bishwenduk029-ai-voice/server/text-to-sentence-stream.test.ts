import { describe, expect, it } from "@jest/globals";
import { textStreamToSentences } from "./text-to-sentence-stream";

describe("textStreamToSentences", () => {
  const createTextStream = (chunks: string[]) => {
    return new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        controller.close();
      },
    });
  };

  it("should convert a simple text stream to sentences", async () => {
    const textStream = createTextStream([
      "You can stream ",
      "text right into ",
      "an audio stream!",
    ]);

    const sentenceStream = textStreamToSentences(textStream);
    const sentences = await collectSentences(sentenceStream);

    expect(sentences).toEqual([
      "You can stream text right into an audio stream!",
    ]);
  });

  it("should handle a text stream with multiple sentences", async () => {
    const textStream = createTextStream([
      "Hello, world! ",
      "This is a test. ",
      "How are you doing? ",
      "I hope you are doing well.",
    ]);

    const sentenceStream = textStreamToSentences(textStream);
    const sentences = await collectSentences(sentenceStream);

    expect(sentences).toEqual([
      "Hello, world!",
      "This is a test.",
      "How are you doing?",
      "I hope you are doing well.",
    ]);
  });

  it("should handle a text stream with various punctuations", async () => {
    const textStream = createTextStream([
      "Exciting, isn't it? ",
      "Let's see how it goes. ",
      "Good luck!",
    ]);

    const sentenceStream = textStreamToSentences(textStream);
    const sentences = await collectSentences(sentenceStream);

    expect(sentences).toEqual([
      "Exciting, isn't it?",
      "Let's see how it goes.",
      "Good luck!",
    ]);
  });

  // Add more test cases with different combinations of text streams

  async function collectSentences(
    sentenceStream: ReadableStream<string>
  ): Promise<string[]> {
    const sentences: string[] = [];
    const reader = sentenceStream.getReader();
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        sentences.push(value);
      }
    }

    return sentences;
  }
});