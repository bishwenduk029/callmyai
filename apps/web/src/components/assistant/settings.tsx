"use client"

import Link from "next/link"
import { redirect } from "next/navigation"
import { RtviConfig } from "@/actions/assistant"

import { Assistant } from "@/db/schema"

import auth from "@/lib/auth"

import { UpdateAssistantDataSourcesForm } from "../data-sources/update-assistant-data-sources-form"
import { AssistantSystemPromptForm } from "./assistant-system-prompt-form"
import { UpdateAssistantDisplayDetails } from "./update-assistant-display-form"

interface SettingsProps {
  assistant: Assistant
  config: RtviConfig
  userId?: string
  userEmail?: string
}

export default function Settings({ assistant, config, userId, userEmail }: SettingsProps) {
  return (
    <div className="grid w-full gap-y-6">
      <UpdateAssistantDisplayDetails assistant={assistant} config={config} />
      <AssistantSystemPromptForm
        assistant={assistant}
        config={config}
        userId={userId!}
      />
      <UpdateAssistantDataSourcesForm
        assistant={assistant}
        config={config}
        userEmail={userEmail!}
      />
    </div>
  )
}
