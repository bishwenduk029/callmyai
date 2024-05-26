import { APICallError } from 'ai';
import { createJsonErrorResponseHandler } from '@ai-sdk/provider-utils';
import { z } from 'zod';

const platHtSpeechErrorDataSchema = z.object({
  error_message: z.string(),
  error_id: z.string()
});

export type ElevenlabsSpeechErrorData = z.infer<typeof platHtSpeechErrorDataSchema>;

export const platHtSpeechFailedResponseHandler: any = createJsonErrorResponseHandler({
  errorSchema: platHtSpeechErrorDataSchema,
  errorToMessage: data => data.error_message,
});
