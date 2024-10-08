"use client"

import Link from "next/link"
import { RtviConfig } from "@/actions/assistant"

import { Assistant } from "@/db/schema"

import { AssistantSystemPromptForm } from "./assistant-system-prompt-form"
import { UpdateAssistantDisplayDetails } from "./update-assistant-name-form"

interface SettingsProps {
  assistant: Assistant
  config: RtviConfig | {}
}

export default function Settings({ assistant, config }: SettingsProps) {
  return (
    <div className="grid w-full gap-y-6">
      <UpdateAssistantDisplayDetails assistant={assistant} config={config} />
      <AssistantSystemPromptForm assistant={assistant} config={config} />
    </div>
  )
}
