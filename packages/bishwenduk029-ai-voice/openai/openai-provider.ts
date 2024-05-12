import {
  generateId,
  loadApiKey,
  withoutTrailingSlash,
} from "@ai-sdk/provider-utils";
import { OpenAISpeechModelId } from "./openai-speech-settings";
import { OpenAISpeechModel } from "./openai-model";

export interface OpenAIProvider {
  (modelId: OpenAISpeechModelId, voiceId?: string): OpenAISpeechModel;

  speech(modelId: OpenAISpeechModelId): OpenAISpeechModel;
}

export interface OpenAIProviderSettings {
  /**
  Use a different URL prefix for API calls, e.g. to use proxy servers.
  The default prefix is `https://api.openai.com`.
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
export function createOpenAI(
  options: OpenAIProviderSettings = {
    voiceId: "alloy",
  }
): OpenAIProvider {
  const createModel = (modelId: OpenAISpeechModelId, voiceId?: string) =>
    new OpenAISpeechModel(modelId, {
      provider: "openai.speech",
      voiceId: voiceId || options.voiceId,
      baseURL:
        withoutTrailingSlash(options.baseURL) ?? "https://api.openai.com",
      headers: () => ({
        "Authorization": `Bearer ${loadApiKey({
          "apiKey": options.apiKey,
          environmentVariableName: "OPENAI_API_KEY",
          description: "OpenAI",
        })}`,
        ...options.headers,
      }),
      generateId: options.generateId ?? generateId,
    });

  const provider = function (modelId: OpenAISpeechModelId, voiceId?: string) {
    if (new.target) {
      throw new Error(
        "The OpenAI speech model function cannot be called with the new keyword."
      );
    }

    return createModel(modelId, voiceId);
  };

  provider.speech = createModel;

  return provider as OpenAIProvider;
}

/**
  Default OpenAI provider instance.
   */
export const openaiSpeech = createOpenAI();
