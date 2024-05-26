'use client'
import { PartialTaskSchema, taskSchema } from '../lib/chat/actions'
import { useStreamableValue } from 'ai/rsc'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'

export interface TaskProps {
  task: PartialTaskSchema
}

const SkeletonCard = () => {
  return (
    <div className="flex flex-col space-y-3">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )
}

export const Task: React.FC<TaskProps> = ({ task }) => {
  const [data, error, pending] = useStreamableValue<PartialTaskSchema>(task)
  return (
    <div className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
      {!pending && data ? (
        <>
          <span className="flex size-2 translate-y-1 rounded-full bg-sky-500" />
          <div className="space-y-1">
            <p className="text-lg font-medium leading-none">{data?.category}</p>
            <p className="text-lg text-muted-foreground">{data?.content}</p>
            {data?.tags?.split(',')?.map((tag, index) => (
              <Badge className="mx-1" key={index}>
                {tag}
              </Badge>
            ))}
          </div>
        </>
      ) : (
        <SkeletonCard />
      )}
    </div>
  )
}
