"use client"

import { useEffect, useState } from "react"
import { getCallSummariesForUser } from "@/actions/user"
import { ArrowClockwise } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Skeleton } from "./ui/skeleton"

interface CallSummary {
  id: string
  title: string | null
  summary: string | null
  createdAt: Date
}

interface CallSummariesProps {
  userId: string
}

const PAGE_SIZE = 20

export function CallSummaries({ userId }: CallSummariesProps) {
  const [callSummaries, setCallSummaries] = useState<CallSummary[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadCallSummaries = async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const { summaries, hasMore: moreAvailable } =
        await getCallSummariesForUser(userId, page, PAGE_SIZE)
      setCallSummaries((prev) => [...prev, ...summaries])
      setHasMore(moreAvailable)
      setPage((prevPage) => prevPage + 1)
    } catch (error) {
      console.error("Error loading call summaries:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCallSummaries()
  }, [])

  const renderCallSummary = (summary: CallSummary) => (
    <Card key={summary.id} className="my-4 w-full">
      <CardHeader>
        <CardTitle>{summary.title || "Untitled Call"}</CardTitle>
        <CardDescription>
          {new Date(summary.createdAt).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>{summary.summary || "No summary available."}</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4 px-4 font-urbanist mb-5">
      {callSummaries.map(renderCallSummary)}
      {loading && (
        <Card className="my-4 w-full">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-4 w-[95%] rounded-xl" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-[20%] rounded-xl" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[125px] w-[95%] rounded-xl" />
          </CardContent>
        </Card>
      )}
      {hasMore && (
        <Button
          onClick={loadCallSummaries}
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <ArrowClockwise className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Load More"
          )}
        </Button>
      )}
    </div>
  )
}
