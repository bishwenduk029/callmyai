import Chat from '@/components/chat'
import { nanoid } from '@/lib/utils'

export const runtime = 'nodejs'

export default function IndexPage() {
  const id = nanoid()

  return <Chat id={id} />
}
