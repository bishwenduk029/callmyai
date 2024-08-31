"use client";

import { VoiceClient as DailyVoiceClient, VoiceEvent as DailyVoiceEvent } from "realtime-ai";
import {
  VoiceClientAudio as DailyVoiceClientAudio,
  VoiceClientProvider as DailyVoiceClientProvider,
  useVoiceClient as useDailyVoiceClient,
  useVoiceClientEvent as useDailyVoiceClientEvent,
} from "realtime-ai-react";

export {
  DailyVoiceClient,
  DailyVoiceEvent,
  DailyVoiceClientAudio,
  DailyVoiceClientProvider,
  useDailyVoiceClient,
  useDailyVoiceClientEvent,
};
