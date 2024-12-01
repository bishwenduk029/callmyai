"use client"

import { useRef, useState } from "react"
import { Sparkle } from "@phosphor-icons/react"
import { Globe } from "@phosphor-icons/react/dist/ssr"
import { useCompletion } from "ai/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

import { LoadingSpinner } from "../audio/chat-room-provider"

interface AIDescriptionInputProps {
  value?: string
  onChange?: (value: string) => void
}

export default function AIDescriptionInput({
  value,
  onChange,
}: AIDescriptionInputProps) {
  const [isAIMode, setIsAIMode] = useState(false)
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { completion, complete } = useCompletion({
    api: "/api/workflows/website",
    onFinish: (prompt, completion) => {
      onChange?.(completion)
    },
  })

  const handleAIFetch = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (!url) return
    setIsLoading(true)
    try {
      await complete(url)
    } catch (error) {
      console.error("Error fetching description:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="m-0 w-full border-0 shadow-none">
      <CardHeader className="p-1">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">About Business</span>
          <div className="flex items-center space-x-2">
            <Label
              htmlFor="ai-mode"
              className="flex cursor-pointer items-center text-sm"
            >
              <Sparkle className="mr-1 h-4 w-4 text-primary" />
              From Website
            </Label>
            <Switch
              id="ai-mode"
              checked={isAIMode}
              onCheckedChange={(checked) => {
                setIsAIMode(checked)
                if (!checked) {
                  onChange?.("")
                  setUrl("")
                }
              }}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-1">
        {isAIMode ? (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="url"
                placeholder="Enter website URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-grow"
                disabled={isLoading}
              />
              <Button onClick={handleAIFetch} disabled={isLoading || !url}>
                {isLoading ? (
                  <LoadingSpinner
                    className="mr-2 h-4 w-4 animate-spin"
                    size={4}
                  />
                ) : (
                  <Globe className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Fetching..." : "Fetch"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter a website URL and let AI generate the description for you.
            </p>
            <Textarea
              id="description"
              placeholder="AI-generated description will appear here..."
              value={completion}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={true}
              rows={2}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="description" className="text-md">
              Brief about your business
            </Label>
            <Textarea
              id="description"
              placeholder="Enter your business description here..."
              value={value || ""}
              onChange={(e) => onChange?.(e.target.value)}
              rows={2}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
