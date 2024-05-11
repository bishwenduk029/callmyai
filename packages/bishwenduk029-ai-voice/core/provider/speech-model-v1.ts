/**
 * Experimental: Specification for a speech model that implements the speech model
 * interface version 1.
 */
export type SpeechModelV1 = {
  /**
   * The language model must specify which language model interface
   * version it implements. This will allow us to evolve the language
   * model interface and retain backwards compatibility. The different
   * implementation versions can be handled as a discriminated union
   * on our side.
   */
  readonly specificationVersion: 'v1';

  /**
   * Name of the provider for logging purposes.
   */
  readonly provider: string;

  /**
   * Provider-specific model ID for logging purposes.
   */
  readonly modelId: string;

  /**
   * Generates a speech model output (streaming).
   *
   * @return A stream of higher-level speech stream.
   */
  doStream(textStream: AsyncIterable<string>): PromiseLike<ReadableStream<Uint8Array>>;
};