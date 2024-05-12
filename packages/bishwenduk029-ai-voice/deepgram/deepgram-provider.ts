import {
    generateId,
    loadApiKey,
    withoutTrailingSlash,
  } from '@ai-sdk/provider-utils';
import { DeepgramSpeechModelId } from './deepgram-speech-settings';
import { DeepgramSpeechModel } from './deepgram-model';
  
  export interface DeepgramProvider {
    (
      modelId: DeepgramSpeechModelId,
    ): DeepgramSpeechModel;
  
    speech(
      modelId: DeepgramSpeechModelId,
    ): DeepgramSpeechModel;
  }
  
  export interface DeepgramProviderSettings {
    /**
  Use a different URL prefix for API calls, e.g. to use proxy servers.
  The default prefix is `https://api.deepgram.com`.
     */
    baseURL?: string;
  
    /**
  API key that is being send using the `Authorization` header.
  It defaults to the `ELEVENLABS_API_KEY` environment variable.
     */
    apiKey?: string;
  
    /**
  Custom headers to include in the requests.
       */
    headers?: Record<string, string>;
  
    generateId?: () => string;
  }
  
  /**
  Create a Mistral AI provider instance.
   */
  export function createDeepgram(
    options: DeepgramProviderSettings = {},
  ): DeepgramProvider {
    const createModel = (
      modelId: DeepgramSpeechModelId,
    ) =>
      new DeepgramSpeechModel(modelId, {
        provider: 'deepgram.speech',
        baseURL:
          withoutTrailingSlash(options.baseURL) ??
          'https://api.deepgram.com',
        headers: () => ({
          Authorization: `Token ${loadApiKey({
            apiKey: options.apiKey,
            environmentVariableName: 'DEEPGRAM_API_KEY',
            description: 'Deepgram',
          })}`,
          ...options.headers,
        }),
        generateId: options.generateId ?? generateId,
      });
  
    const provider = function (
      modelId: DeepgramSpeechModelId,
    ) {
      if (new.target) {
        throw new Error(
          'The Deepgram speech model function cannot be called with the new keyword.',
        );
      }
  
      return createModel(modelId);
    };
  
    provider.speech = createModel;
  
    return provider as DeepgramProvider;
  }
  
  /**
  Default Deepgram speech provider instance.
   */
  export const deepgramSpeech = createDeepgram();