/* eslint-disable no-unused-vars */
import { SpeechProvider } from "./base.provider";

export class DeepgramProvider implements SpeechProvider {
  private readonly api = "https://api.deepgram.com";

  constructor(
    private apiKey: string,
    private voiceID?: string
  ) {}

  async getAudioStream(text: string): Promise<ReadableStream> {
    console.log(
      "Provider Speech called",
      this.api,
      this.apiKey,
      this.voiceID,
      text
    );
    const response = await fetch(
      `${this.api}/v1/speak?model=${this.voiceID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${this.apiKey}`,
        },
        body: JSON.stringify({
          text,
        }),
      }
    );

    if (!response.ok) {
      console.log(response.status)
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();

    const stream = new ReadableStream({
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

    return stream;
  }
}
