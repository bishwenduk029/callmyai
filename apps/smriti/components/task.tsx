'use client'
import { PartialTaskSchema, TaskSchema, taskSchema } from '../lib/chat/actions'
import { useStreamableValue } from 'ai/rsc'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from './ui/card'
import { Button } from './ui/button'
import { Key } from 'react'

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
    <>
      {!pending && data ? (
        <>
          <SimpleTask
            category={data?.category}
            content={data?.content}
            tags={data?.tags}
          />
        </>
      ) : (
        <SkeletonCard />
      )}
    </>
  )
}

export const SimpleTask: React.FC<PartialTaskSchema> = ({
  category,
  content,
  tags
}) => {
  return (
    <motion.div
      whileHover={{
        scale: 1.02
      }}
    >
      <Card className="mb-4 w-full last:mb-0 last:pb-0 border-mute-foreground border-2 rounded-lg shadow-lg bg-white">
        <CardHeader className="w-full  -mb-5">
          <CardTitle className="w-full font-extrabold italic">{category}</CardTitle>
          <CardDescription className="w-full font-medium text-lg">{content}</CardDescription>
        </CardHeader>
        <CardFooter className="w-full flex flex-row flex-wrap space-x-2">
          {tags
            ?.split(',')
            ?.map((tag: string, index: Key | null | undefined) => (
              <Button className="p-0 text-slate-500 hover:text-primary" variant="link" key={index}>
                {`#${tag.trim().split(' ').join('-')}`}
              </Button>
            ))}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
