import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { auth } from '@/auth'
import { Session } from '@/lib/types'
import { getContents } from '@/app/actions'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Next.js AI Chatbot'
}

export default async function IndexPage() {
  const session = (await auth()) as Session

  if (!session) {
    return (
      <AI initialAIState={null} initialUIState={[]}>
        <Chat session={session} initialMessages={[]} />
      </AI>
    )
  }

  const contents = await getContents(session.user.id)

  return (
    <AI initialAIState={null} initialUIState={[]}>
      <Chat session={session} initialMessages={contents} />
    </AI>
  )
}
