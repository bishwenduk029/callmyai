'use client'

import { useEffect, useState } from "react"
import { IframeWrapper } from "@/components/assistant/iframe-wrapper"
import { env } from "@/env.mjs"

interface AssistantIframeProps {
  assistantId: string
}

export function AssistantIframe({ assistantId }: AssistantIframeProps) {
  const [key, setKey] = useState(0)

  useEffect(() => {
    const handleAssistantUpdate = () => {
      setKey((prevKey) => prevKey + 1)
    }

    window.addEventListener("assistantUpdated", handleAssistantUpdate)

    return () => {
      window.removeEventListener("assistantUpdated", handleAssistantUpdate)
    }
  }, [])

  return (
    <IframeWrapper
      key={key}
      src={`${env.NEXT_PUBLIC_APP_URL}/assistants/${assistantId}`}
      className="w-full h-3/4 rounded-2xl border-2 border-black"
      style={{
        boxShadow: "0 0 15px 2px rgba(0, 0, 0, 0.5)",
        overflow: "hidden",
      }}
      allow="autoplay; encrypted-media"
      allowFullScreen
      scrolling="no"
    />
  )
}
