"use client"

import { useState } from "react"
import { getCallSummariesForUser } from "@/actions/user"
import { ArrowClockwise, Star } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { PAGE_SIZE } from "../lib/utils"
import CallSummaryLoadingState from "./call-summary-loader"
import { Skeleton } from "./ui/skeleton"
import { Icons } from "./icons"

interface CallSummary {
  id: string
  title: string | null
  summary: string | null
  createdAt: Date
}

interface CallSummariesProps {
  userId: string
  initialSummaries: {
    summaries: CallSummary[]
    hasMore: boolean
  }
}

export function CallSummaries({
  userId,
  initialSummaries,
}: CallSummariesProps) {
  const [callSummaries, setCallSummaries] = useState<CallSummary[]>(
    initialSummaries.summaries
  )
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialSummaries.hasMore)

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

  const renderCallSummary = (summary: CallSummary) => (
    <Card key={summary.id} className="w-full">
      <CardHeader>
        <CardTitle>{summary.title || "Untitled Call"}</CardTitle>
        <CardDescription>
          {new Date(summary.createdAt).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>{summary.summary || "No summary available."}</p>
      </CardContent>
      <CardFooter>
        <div className="flex items-center">
          <Star className={`text-yellow-500 cursor-pointer ${summary.isInteresting ? 'text-yellow-500' : 'text-gray-500'}`} />
          <span className="ml-2 text-sm text-gray-500">Mark as interesting to update AI assistant</span>
        </div>
      </CardFooter>
    </Card>
  )

  return (
    <div className="mb-5 w-full space-y-4 font-urbanist">
      {callSummaries.length === 0 && (
        <p className="text-md mt-4 text-center text-gray-500">
          No call summaries found. Share your call handle with others to get
          started.
        </p>
      )}
      {callSummaries.map(renderCallSummary)}
      {loading && <CallSummaryLoadingState />}
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
