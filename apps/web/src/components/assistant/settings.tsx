"use client"

import Link from "next/link"
import { redirect } from "next/navigation"
import { RtviConfig } from "@/actions/assistant"

import { Assistant, User } from "@/db/schema"

import auth from "@/lib/auth"

import { AssistantPhoneNumberForm } from "../dashboard/assistant-phone-number-form"
import { PhoneNumberForm } from "../dashboard/phone-number-form"
import { UpdateAssistantDataSourcesForm } from "../data-sources/update-assistant-data-sources-form"
import { AssistantSystemPromptForm } from "./assistant-system-prompt-form"
import { UpdateAssistantDisplayDetails } from "./update-assistant-display-form"

interface SettingsProps {
  assistant: Assistant
  config: RtviConfig
  user: User
}

export default function Settings({ assistant, config, user }: SettingsProps) {
  return (
    <div className="grid w-full gap-y-6">
      <UpdateAssistantDisplayDetails assistant={assistant} config={config} />
      <AssistantSystemPromptForm
        assistant={assistant}
        config={config}
        userId={user.id}
      />
      <UpdateAssistantDataSourcesForm
        assistant={assistant}
        config={config}
        userEmail={user.email}
      />
      <AssistantPhoneNumberForm
        assistantId={assistant.id}
        currentPhoneNumber={assistant.phoneNumber}
      />
    </div>
  )
}
