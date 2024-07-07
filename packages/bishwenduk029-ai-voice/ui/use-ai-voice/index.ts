import { useState, useEffect } from "react";
import {
  type ReactRealTimeVADOptions,
  useMicVAD,
  utils,
} from "@ricky0123/vad-react";

interface VoiceChatOptions {
  api: string;
  body: any;
  initialMessages: any;
  speakerPause: number;
  onSpeechCompletion: () => Promise<void>;
}

export type UseVoiceChatHelpers = {
  speaking: boolean;
  listening: boolean;
  thinking: boolean;
  initialized: boolean;
  messages: any;
  setMessages: any;
};

function useAiVoice({
  api,
  body,
  initialMessages,
  speakerPause = 250,
  onSpeechCompletion: onCompletion,
}: VoiceChatOptions): UseVoiceChatHelpers {
  const [speaking, setSpeaking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [accumulatedText, setAccumulatedText] = useState<string>("");
  const [speechEndTimeout, setSpeechEndTimeout] = useState<any | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement>();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const newAudio = new Audio();
    setAudio(newAudio);
  }, []);

  const vad: {
    listening: boolean;
    errored:
      | false
      | {
          message: string;
        };
    loading: boolean;
    userSpeaking: boolean;
    pause: () => void;
    start: () => void;
    toggle: () => void;
  } = useMicVAD({
    startOnLoad: false,
    modelURL: "/silero_vad.onnx",
    workletURL: "/vad.worklet.bundle.min.js",
    onSpeechStart: () => {
      setSpeaking(false);
      setThinking(false);
      setListening(true);
      audio?.pause();

      if (speechEndTimeout) {
        clearTimeout(speechEndTimeout);
        setSpeechEndTimeout(null);
      }
    },
    // Inside the `onSpeechEnd` callback
    onSpeechEnd: async (audio: Float32Array) => {
      const wavBuffer = utils.encodeWAV(audio);
      const blob = new Blob([wavBuffer], { type: "audio/mpeg" });

      const response = await fetch(api, {
        method: "POST",
        body: createBody(blob),
      });

      if (!response.ok) {
        console.error("Error fetching audio:", response.statusText);
        return;
      }

      const contentType = response.headers.get("Content-Type");

      playAudioStream(response.body, contentType);
    },
  } as Partial<ReactRealTimeVADOptions>);

  async function playAudioStream(
    audioStream: ReadableStream<Uint8Array> | null,
    contentType: string | null
  ) {
    if (!audioStream || !contentType) {
      console.error("Failed to receive audio stream from server");
      return;
    }
    setListening(false);
    setSpeaking(true);

    const reader: ReadableStreamDefaultReader<Uint8Array> | undefined =
      audioStream?.getReader();

    if (audio) {
      audio.autoplay = true;
      const mediaSource = new MediaSource();
      audio.src = URL.createObjectURL(mediaSource);

      mediaSource.addEventListener("sourceopen", async () => {
        // @ts-ignore
        const sourceBuffer = mediaSource.addSourceBuffer(
          contentType || "audio/mpeg"
        );
        let isLastChunk = false;

        sourceBuffer.addEventListener("updateend", appendNextChunk);

        async function appendNextChunk() {
          if (isLastChunk) {
            mediaSource.endOfStream();
            setSpeaking(false);
            return;
          }

          // @ts-ignore
          const { done, value } = await reader.read();

          if (done) {
            isLastChunk = true;
            sourceBuffer.appendBuffer(new Uint8Array(0));
            setSpeaking(false);
            return;
          }

          try {
            sourceBuffer.appendBuffer(value);
          } catch (error) {
            console.error("Error appending buffer:", error);
          }
        }

        appendNextChunk();
      });
    }

    await onCompletion();
  }

  const createBody = (data: Blob) => {
    const formData = new FormData();
    formData.append("audio", data, "audio.wav");

    // Add additional body attributes
    Object.keys(body).forEach((key) => {
      formData.append(key, body[key]);
    });
    return formData;
  };

  useEffect(() => {
    setInitialized(vad.listening);
  }, [vad]);

  const start = () => {
    vad.toggle();
  };

  const stop = () => {
    vad.toggle();
  };

  return {
    start,
    stop,
    speaking,
    listening,
    thinking,
    initialized,
    messages,
    setMessages,
  } as UseVoiceChatHelpers;
}

export default useAiVoice;
