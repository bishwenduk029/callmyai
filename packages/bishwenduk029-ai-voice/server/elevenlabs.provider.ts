/* eslint-disable no-unused-vars */
import { SpeechProvider } from "./base.provider";

export class ElevenLabsProvider implements SpeechProvider {
  private readonly api = "https://api.elevenlabs.io";

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
      `${this.api}/v1/text-to-speech/${this.voiceID}/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": this.apiKey,
        },
        body: JSON.stringify({
          model_id: "eleven_turbo_v2",
          text,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true,
          },
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
