/* eslint-disable no-undef */
const GRPC_STREAMING = {
MAX_NUMBER_OF_LINES: 6,
  LINE_MAX_LENGTH: 300,
  LINE_DESIRED_LENGTH: 200,
};

const PUNCTUATION_REGEX = /[!?]/;

export function textStreamToSentences(
  inputStream: AsyncIterable<String>
): ReadableStream<string> {
  const outStream = new ReadableStream({
    start(controller) {
      let buffer = '';

      (async () => {
        for await (let chunk of inputStream) {
          buffer += chunk;
          let punctuationMatch;

          while ((punctuationMatch = PUNCTUATION_REGEX.exec(buffer)) !== null) {
            const sentenceEnd = punctuationMatch.index + 1;
            const sentence = buffer.slice(0, sentenceEnd).trim();
            buffer = buffer.slice(sentenceEnd);

            if (sentence.length > 0) {
              controller.enqueue(sentence);
            }
          }
        }

        // Process any remaining text in the buffer
        if (buffer.length > 0) {
          controller.enqueue(buffer.trim());
        }

        controller.close();
      })();
    },
  });

  return outStream;
}