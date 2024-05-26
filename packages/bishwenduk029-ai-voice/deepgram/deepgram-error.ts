import { createJsonErrorResponseHandler } from '@ai-sdk/provider-utils';
import { z } from 'zod';

const deepgramSpeechErrorDataSchema = z.object({
  err_msg: z.string(),
  request_id: z.string().nullable(),
  err_code: z.string().nullable(),
});

export type DeepgramSpeechErrorData = z.infer<typeof deepgramSpeechErrorDataSchema>;

export const deepgramSpeechFailedResponseHandler: any = createJsonErrorResponseHandler({
  errorSchema: deepgramSpeechErrorDataSchema,
  errorToMessage: data => data.err_msg,
});
