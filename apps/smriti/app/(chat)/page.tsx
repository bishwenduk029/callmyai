import { UserBoard } from '@/components/user-board'
import { AI } from '@/lib/chat/actions'
import { getContents } from '@/app/actions'
import { getCurrentUser } from '../auth/actions'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Smriti - AI Memory Organizer'
}

export default async function IndexPage() {
  const user = await getCurrentUser()

  const contents = user ? await getContents(user.id) : []

  return (
    <AI initialAIState={null} initialUIState={[]}>
      <UserBoard initialMessages={contents} />
    </AI>
  )
}
