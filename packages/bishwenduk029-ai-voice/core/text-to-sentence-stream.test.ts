import { describe, expect, it } from "@jest/globals";
import { textStreamToSentences } from "./text-to-sentence-stream";

describe("textStreamToSentences", () => {
  const createTextStream = (chunks: string[]): AsyncIterable<string> => {
    return (async function*() {
      for(const chunk of chunks) {
        yield chunk;
      }
    })();
  };

  it("should convert a simple text stream to sentences", async () => {
    const textStream = createTextStream([
      "You can stream ",
      "text right into ",
      "an audio stream!",
    ]);

    const sentenceStream = await textStreamToSentences(textStream);
    const sentences = await collectSentences(sentenceStream);

    expect(sentences).toEqual([
      "You can stream text right into an audio stream!"
    ]);
  });

  it("should handle a text stream with multiple sentences", async () => {
    const textStream = createTextStream([
      "Hello, world! ",
      "This is a test. ",
      "How are you doing? ",
      "I hope you are doing well."
    ]);

    const sentenceStream = await textStreamToSentences(textStream);
    const sentences = await collectSentences(sentenceStream);

    expect(sentences).toEqual([
      "Hello, world!",
      "This is a test.",
      "How are you doing?",
      "I hope you are doing well."
    ]);
  });

  it("should handle a text stream with various punctuations", async () => {
    const textStream = createTextStream([
      "Exciting, isn't it? ",
      "Let's see how it goes. ",
      "Good luck!"
    ]);

    const sentenceStream = await textStreamToSentences(textStream);
    const sentences = await collectSentences(sentenceStream);

    expect(sentences).toEqual([
      "Exciting, isn't it?",
      "Let's see how it goes.",
      "Good luck!"
    ]);
  });
  
  // Add more test cases with different combinations of text streams

  async function* streamToAsyncIterable(stream: ReadableStream<string>): AsyncGenerator<string, void, unknown> {
    const reader = stream.getReader();
    
    while (true) {
      // The result will have a done property which is true when the stream is closed
      const result = await reader.read();
      
      if (result.done) break;
      
      yield result.value;
    }
  }

  async function collectSentences(sentenceStream: ReadableStream<string>): Promise<string[]> {
    const sentences: string[] = [];
    
    for await (let sentence of streamToAsyncIterable(sentenceStream)) {
      sentences.push(sentence);
    }

    return sentences;
  }
});
