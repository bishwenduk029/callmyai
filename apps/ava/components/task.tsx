import { PartialTaskSchema, taskSchema } from '../lib/chat/actions'
import { useStreamableValue } from 'ai/rsc'
import { Badge } from './ui/badge'
import {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  PromiseLikeOfReactNode
} from 'react'

export interface SearchRelatedProps {
  task: PartialTaskSchema
}

export const Task = ({
  content,
  tags,
  category
}: {
  content: string
  tags: string
  category: string
}) => {
  console.log(content, tags, category)
  return (
    <div className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
      <span className="flex size-2 translate-y-1 rounded-full bg-sky-500" />
      <div className="space-y-1">
        <p className="text-lg font-medium leading-none">{category}</p>
        <p className="text-lg text-muted-foreground">{content}</p>
        {tags.split(',').map((tag, index) => (
          <Badge className='mx-1' key={index}>{tag}</Badge>
        ))}
      </div>
    </div>
  )
}
