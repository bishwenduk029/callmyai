import { APICallError } from 'ai';
import { createJsonErrorResponseHandler } from '@ai-sdk/provider-utils';
import { z } from 'zod';

const elevenlabsSpeechErrorDataSchema = z.object({
  detail: z.object({
    loc: z.array(z.string()),
    msg: z.string(),
    type: z.string()
  }),
});

export type ElevenlabsSpeechErrorData = z.infer<typeof elevenlabsSpeechErrorDataSchema>;

export const elevenlabsSpeechFailedResponseHandler = createJsonErrorResponseHandler({
  errorSchema: elevenlabsSpeechErrorDataSchema,
  errorToMessage: data => data.detail.msg,
});
