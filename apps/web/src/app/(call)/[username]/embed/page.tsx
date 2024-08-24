import { ChatRoomProvider } from "@/components/audio/chat-room-provider"

export default async function ChatRoomEmbededPage({
  params,
}: {
  params: { username: string }
}) {
  return (
    <>
      <div className="container bg-black">
        <ChatRoomProvider visitor={null} hostUsername={params.username} />
      </div>
    </>
  )
}
