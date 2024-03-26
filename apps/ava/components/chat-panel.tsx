import { type UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconRefresh, IconStop } from '@/components/ui/icons'
import { FooterText } from '@/components/footer'
import { addMessage } from '@/app/actions'
import { useVoiceChat } from '@bishwenduk029/ai-voice/ui'

const AGENT_ENABLED = process.env.NEXT_PUBLIC_AVA_AGENT_MODE === 'true'

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
    UseChatHelpers,
    | 'append'
    | 'isLoading'
    | 'reload'
    | 'messages'
    | 'stop'
    | 'input'
    | 'setInput'
  > {
  id?: string
  onHumanSpeechStart: any
}

export default function ChatPanel({
  id,
  isLoading,
  stop,
  append,
  reload,
  input,
  setInput,
  messages,
  onHumanSpeechStart
}: ChatPanelProps) {
  const [speaking, listening, thinking, initialized] = useVoiceChat({
    api: '/api/chat/voice',
    transcribeAPI: '/api/transcribe',
    speakerPause: 500
  })

  return (
    <div className="fixed inset-x-0 bottom-0 bg-gradient-to-b from-muted/10 from-10% to-muted/30 to-50%">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="flex h-10 items-center justify-center">
          {isLoading ? (
            <Button
              variant="outline"
              onClick={() => stop()}
              className="bg-background"
            >
              <IconStop className="mr-2" />
              Stop generating
            </Button>
          ) : (
            messages?.length > 0 && (
              <Button
                variant="outline"
                onClick={() => reload()}
                className="bg-background"
              >
                <IconRefresh className="mr-2" />
                Regenerate response
              </Button>
            )
          )}
        </div>
        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          {initialized ? (
            <div id="relative flex justify-center align-center max-h-60 h-20 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
              <div
                className={`m-auto h-[100px] w-[100px] ${
                  (isLoading || thinking) && 'animate-pulse'
                } rounded-full ${speaking ? 'bg-blue-300' : 'bg-orange-600'}`}
              >
                <span
                  className={`inline-flex h-full w-full ${
                    thinking ? '' : 'animate-ping'
                  } rounded-full ${speaking ? 'bg-blue-300' : 'bg-orange-600'}`}
                ></span>
                {(thinking || speaking) && (
                  <span className="animate-pluse">
                    {thinking ? 'Thinking...' : 'Speaking...'}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <PromptForm
              onSubmit={async value => {
                await addMessage({
                  // @ts-ignore
                  id,
                  content: value,
                  role: 'user'
                })
                await append({
                  id,
                  content: value,
                  role: 'user'
                })
              }}
              input={input}
              setInput={setInput}
              isLoading={isLoading || !initialized}
              handleMicOn={() => null}
              micLoading={!initialized}
            />
          )}
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  )
}
