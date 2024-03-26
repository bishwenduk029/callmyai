import { SpeechProvider } from "./base.provider";

export class OpenAIProvider implements SpeechProvider {
  private readonly defaultAPI = "https://api.openai.com";

  constructor(
    private apiKey: string,
    private apiURL?: string,
    private voice: string
  ) {}

  async getAudioStream(text: string): Promise<ReadableStream> {
    const api = this.apiURL || this.defaultAPI;

    const response = await fetch(`${api}/audio/speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        input: text,
        model: "tts-1",
        voice: this.voice,
        stream: true,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
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
