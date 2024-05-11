import {
  generateId,
  loadApiKey,
  withoutTrailingSlash,
} from "@ai-sdk/provider-utils";
import { ElevenlabsSpeechModelId } from "./elevenlabs-speech-settings";
import { ElevenlabsSpeechModel } from "./elevenlabs-model";

export interface ElevenlabsProvider {
  (modelId: ElevenlabsSpeechModelId, voiceId?: string): ElevenlabsSpeechModel;

  speech(modelId: ElevenlabsSpeechModelId): ElevenlabsSpeechModel;
}

export interface ElevenlabsProviderSettings {
  /**
  Use a different URL prefix for API calls, e.g. to use proxy servers.
  The default prefix is `https://api.elevenlabs.com`.
     */
  baseURL?: string;

  /**
  API key that is being send using the `Authorization` header.
  It defaults to the `ELEVENLABS_API_KEY` environment variable.
     */
  apiKey?: string;
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
export function createElevenlabs(
  options: ElevenlabsProviderSettings = {
    voiceId: "AZnzlk1XvdvUeBnXmlld",
  }
): ElevenlabsProvider {
  const createModel = (modelId: ElevenlabsSpeechModelId, voiceId?: string) =>
    new ElevenlabsSpeechModel(modelId, {
      provider: "elevenlabs.speech",
      voiceId: voiceId || options.voiceId,
      baseURL:
        withoutTrailingSlash(options.baseURL) ?? "https://api.elevenlabs.io",
      headers: () => ({
        "xi-api-key": `${loadApiKey({
          apiKey: options.apiKey,
          environmentVariableName: "ELEVENLABS_API_KEY",
          description: "Elevenlabs",
        })}`,
        ...options.headers,
      }),
      generateId: options.generateId ?? generateId,
    });

  const provider = function (modelId: ElevenlabsSpeechModelId, voiceId?: string) {
    if (new.target) {
      throw new Error(
        "The Elevenlabs speech model function cannot be called with the new keyword."
      );
    }

    return createModel(modelId, voiceId);
  };

  provider.speech = createModel;

  return provider as ElevenlabsProvider;
}

/**
  Default Elevenlabs provider instance.
   */
export const elevenlabsSpeech = createElevenlabs();
