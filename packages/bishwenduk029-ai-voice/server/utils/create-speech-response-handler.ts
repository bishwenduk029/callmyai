import {
    ResponseHandler,
    extractResponseHeaders,
  } from "@ai-sdk/provider-utils";

export const createSpeechResponseHandler =
  <Uint8Array>(): ResponseHandler<ReadableStream<Uint8Array>> =>
  async ({ response }: { response: Response }) => {
    const reader = response.body?.getReader();
    const responseHeaders = extractResponseHeaders(response);

    const audioStream = new ReadableStream({
      async start(controller) {
        if (!reader) {
          controller.error(new Error("Response body is null or undefined"));
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }
            controller.enqueue(value);
          }
        } catch (error) {
          controller.error(error);
        }
      },
    });
    return {
      responseHeaders,
      value: audioStream,
    };
  };