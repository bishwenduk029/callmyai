"use client"

import Link from "next/link"
import { RtviConfig } from "@/actions/assistant"

import { Assistant } from "@/db/schema"

import { AssistantSystemPromptForm } from "./assistant-system-prompt-form"
import { UpdateAssistantNameForm } from "./update-assistant-name-form"

interface SettingsProps {
  assistant: Assistant
  config: RtviConfig | {}
}

const currentDomain = process.env["NEXT_PUBLIC_APP_URL"]

export default function Settings({ assistant, config }: SettingsProps) {
  return (
    <div className="grid w-full gap-y-6">
      <UpdateAssistantNameForm assistant={assistant} />
      <AssistantSystemPromptForm assistant={assistant} config={config} />

      <Link
        className=" mx-auto text-sm font-normal text-primary underline-offset-4 transition-colors hover:underline"
        aria-label="Test/Preview Your AI Call Assistant"
        href={`${currentDomain}/assistants/${assistant.id}`}
        rel="noopener noreferrer"
      >
        Test/Preview Your AI Call Assistant
        <span className="sr-only">Test/Preview Your AI Call Assistant</span>
      </Link>
    </div>
  )
}
