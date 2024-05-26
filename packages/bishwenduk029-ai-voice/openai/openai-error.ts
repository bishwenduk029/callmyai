import { APICallError } from 'ai';
import { createJsonErrorResponseHandler } from '@ai-sdk/provider-utils';
import { z } from 'zod';

const openAISpeechErrorDataSchema = z.object({
  error_message: z.string(),
  error_id: z.string()
});

export type ElevenlabsSpeechErrorData = z.infer<typeof openAISpeechErrorDataSchema>;

export const platHtSpeechFailedResponseHandler: any = createJsonErrorResponseHandler({
  errorSchema: openAISpeechErrorDataSchema,
  errorToMessage: data => data.error_message,
});
