import { fetchAssistantById } from "@/actions/assistants"

import { ChatRoomProvider } from "@/components/audio/chat-room-provider"

export default async function ChatRoomEmbededPage({
  params,
}: {
  params: { assistantId: string }
}) {
  const newSession = await fetchAssistantById({ id: params.assistantId })

  return (
    <>
      <div className="container bg-black">
        <ChatRoomProvider chatSession={newSession} />
      </div>
    </>
  )
}
