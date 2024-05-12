import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { FooterText } from '@/components/footer'
import { UseVoiceChatHelpers } from '@bishwenduk029/ai-voice/ui/use-voice-chat/index'

const barStyle: any = {
  borderRadius: {
    max: 100,
    min: 0,
    step: 1,
    value: 8
  },
  count: {
    max: 48,
    min: 0,
    step: 1,
    value: 13
  },
  gap: {
    max: 24,
    min: 0,
    step: 1,
    value: 4
  },
  maxHeight: {
    max: 480,
    min: 0,
    step: 1,
    value: 144
  },
  minHeight: {
    max: 480,
    min: 0,
    step: 1,
    value: 48
  },
  width: {
    max: 48,
    min: 0,
    step: 1,
    value: 16
  }
}

export interface ChatPanelProps
  extends Pick<
    UseVoiceChatHelpers,
    | 'speaking'
    | 'listening'
    | 'thinking'
    | 'initialized'
    | 'thinking'
    | 'messages'
  > {
  id?: string
  onHumanSpeechStart?: any
}

export default function ChatPanel({
  id,
  speaking,
  listening,
  thinking,
  initialized
}: ChatPanelProps) {
  return (
    <div className="from-muted/10 to-muted/30 fixed inset-x-0 bottom-0 bg-gradient-to-b from-10% to-50%">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="bg-background space-y-4 border-t px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          {initialized ? (
            <div id="relative flex justify-center align-center max-h-60 h-20 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
              {thinking && (
                <div className="m-auto h-[100px] w-[100px] rounded-full bg-orange-600">
                  <span
                    className={`inline-flex h-full w-full animate-pulse rounded-full bg-orange-600`}
                  ></span>
                  <span>Thinking...</span>
                </div>
              )}
              {speaking && (
                <div className="m-auto h-[100px] w-[100px] rounded-full bg-blue-300">
                  <span
                    className={`inline-flex h-full w-full animate-ping rounded-full bg-blue-300`}
                  ></span>
                  <span>Speaking...</span>
                </div>
              )}
              {listening && (
                <div className="m-auto h-[100px] w-[100px] rounded-full bg-orange-600">
                  <span
                    className={`inline-flex h-full w-full animate-ping rounded-full bg-orange-600`}
                  ></span>
                  <span>Listening...</span>
                </div>
              )}
            </div>
          ) : (
            <div />
          )}
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  )
}
