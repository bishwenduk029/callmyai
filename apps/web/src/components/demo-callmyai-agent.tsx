import {
  TrialAssistant
} from "@/actions/assistant"



import { DailyChatRoomProvider } from "@/components/audio/chat-room-provider"

import { ChatRoomSession } from "./audio/callmyai-room"

export default function DemoCallMyAIAgent({
  trialAssistant,
}: {
  trialAssistant: TrialAssistant
}) {
  const chatRoomSession: ChatRoomSession = {
    exhausted: false,
    duration: 75,
    private: false,
    assistantId: trialAssistant.id,
    baseUrl: "/api/assistants/start",
    header: trialAssistant.name,
    description: trialAssistant.config?.description || "",
    avatar: trialAssistant.config.avatar || "",
    botName: trialAssistant.config.header,
  }

  return (
    <div className="container w-full">
      <DailyChatRoomProvider
        configuration={trialAssistant.config}
        session={chatRoomSession}
        isTrial={true}
      />
    </div>
  )
}
