import { useState, useEffect } from "react";
import {
  type ReactRealTimeVADOptions,
  useMicVAD,
  utils,
} from "@ricky0123/vad-react";

interface VoiceChatOptions {
  api: string;
  speakerPause: number;
  onSpeechCompletion?: () => Promise<void>;
}

export type UseVoiceChatHelpers = {
  listening: boolean;
  vad: {
    listening: boolean;
    errored: false | {
        message: string;
    };
    loading: boolean;
    userSpeaking: boolean;
    pause: () => void;
    start: () => void;
    toggle: () => void;
};
  setStartRecording: any;
  text: string;
};

function useTranscription({
  api,
  speakerPause = 60000,
  onSpeechCompletion: onCompletion,
}: VoiceChatOptions): UseVoiceChatHelpers {
  const [startRecording, setStartRecording] = useState(false);
  const [listening, setListening] = useState(false);
  const [accumulatedText, setAccumulatedText] = useState<string>("");
  const [speechEndTimeout, setSpeechEndTimeout] = useState<any | null>(null);
  const [initialized, setInitialized] = useState(false);

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
      setListening(true);

      if (speechEndTimeout) {
        clearTimeout(speechEndTimeout);
        setSpeechEndTimeout(null);
      }
    },
    // Inside the `onSpeechEnd` callback
    onSpeechEnd: async (audio: Float32Array) => {
      let updatedAccumulatedText = accumulatedText;
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

      response.json().then(({ transcript }: { transcript: string }) => {
        if (transcript) {
          updatedAccumulatedText = accumulatedText + " " + transcript;
          setAccumulatedText(updatedAccumulatedText);
        }
      });

      if (speechEndTimeout) {
        clearTimeout(speechEndTimeout);
      }

      const timeout = setTimeout(() => {
        processSpeechEnd(updatedAccumulatedText);
      }, speakerPause);

      setSpeechEndTimeout(timeout);
    },
  } as Partial<ReactRealTimeVADOptions>);

  async function processSpeechEnd(accumulatedText: string) {
    if (accumulatedText.length > 0) {
      setListening(false);
      onCompletion && await onCompletion();
    }
  }

  const createBody = (data: Blob) => {
    const formData = new FormData();
    formData.append("audio", data, "audio.wav");
    return formData;
  };

  useEffect(() => {
    if (startRecording) {
      console.log("I am about to start vad")
      vad.start();
      console.log("VAD starterd", vad.listening)
      return;
    }
    vad.pause();
  }, [startRecording]);

  return {
    listening,
    vad,
    setStartRecording,
    text: accumulatedText,
  } as UseVoiceChatHelpers;
}

export default useTranscription;
