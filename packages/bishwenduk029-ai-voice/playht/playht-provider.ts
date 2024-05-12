import {
  generateId,
  loadApiKey,
  withoutTrailingSlash,
} from "@ai-sdk/provider-utils";
import { PlayHtSpeechModelId } from "./playht-speech-settings";
import { PlayHtSpeechModel } from "./playht-model";

export interface PlayHtProvider {
  (modelId: PlayHtSpeechModelId, userId: string, voiceId?: string): PlayHtSpeechModel;

  speech(modelId: PlayHtSpeechModelId): PlayHtSpeechModel;
}

export interface PlayHtProviderSettings {
  /**
  Use a different URL prefix for API calls, e.g. to use proxy servers.
  The default prefix is `https://api.playht.com`.
     */
  baseURL?: string;

  /**
  API key that is being send using the `Authorization` header.
  It defaults to the `ELEVENLABS_API_KEY` environment variable.
     */
  apiKey?: string;
  userId: string;
  voiceId: string;

  /**
  Custom headers to include in the requests.
       */
  headers?: Record<string, string>;

  generateId?: () => string;
}

/**
  Create a Mistral AI provider instance.
   */
export function createPlayHt(
  options: PlayHtProviderSettings = {
    voiceId: "AZnzlk1XvdvUeBnXmlld",
    userId: "",
  }
): PlayHtProvider {
  const createModel = (modelId: PlayHtSpeechModelId, userId: string, voiceId?: string) =>
    new PlayHtSpeechModel(modelId, {
      provider: "playht.speech",
      voiceId: voiceId || options.voiceId,
      baseURL:
        withoutTrailingSlash(options.baseURL) ?? "https://api.play.ht",
      headers: () => ({
        "AUTHORIZATION": `${loadApiKey({
          "apiKey": options.apiKey,
          environmentVariableName: "PLAYHT_API_KEY",
          description: "PlayHt",
        })}`,
        "X-USER-ID": userId || options.userId,
        ...options.headers,
      }),
      generateId: options.generateId ?? generateId,
    });

  const provider = function (modelId: PlayHtSpeechModelId, userId: string, voiceId?: string) {
    if (new.target) {
      throw new Error(
        "The PlayHt speech model function cannot be called with the new keyword."
      );
    }

    return createModel(modelId, userId, voiceId);
  };

  provider.speech = createModel;

  return provider as PlayHtProvider;
}

/**
  Default PlayHt provider instance.
   */
export const playhtSpeech = createPlayHt();
