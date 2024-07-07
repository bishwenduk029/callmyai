// components/ChatList.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Chat {
  id: string
  title: string | null
  summary: string | null
  createdAt: Date
}

interface ChatListProps {
  chats: Chat[]
}

export function ChatList({ chats }: ChatListProps) {
  return (
    <ScrollArea className="h-full w-full rounded-md">
      <div className="px-4 space-y-4 font-urbanist">
        {chats.map((chat) => (
          <Card key={chat.id}>
            <CardHeader>
              <CardTitle>{chat.title || 'Untitled Chat'}</CardTitle>
              <CardDescription>{new Date(chat.createdAt).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{chat.summary || 'No summary available.'}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}