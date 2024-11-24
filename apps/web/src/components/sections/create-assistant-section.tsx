"use client"

import { useState } from "react"
import { TrialAssistant } from "@/actions/assistant"

import { CreateAssistantNameForm } from "../assistant/create-assistant-name-form"
import DemoCallMyAIAgent from "../demo-callmyai-agent"
import { Card, CardContent } from "../ui/card"
import { Section } from "../ui/section"

export function CreateAssistantSection() {
  const [createdAssistant, setCreatedAssistant] =
    useState<TrialAssistant | null>(null)

  const handleSuccess = (assistant: TrialAssistant) => {
    setCreatedAssistant(assistant)
  }

  return (
    <Section className="font-urbanist overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
            Create Your AI Voice Assistant
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Customize your AI assistant with natural voices and personalities
            that sound just like humans
          </p>
        </div>
        <Card className="mx-auto w-full max-w-4xl border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardContent className={createdAssistant ? "p-0" : "p-8"}>
            {createdAssistant ? (
              <div className="relative h-[700px]">
                <DemoCallMyAIAgent trialAssistant={createdAssistant} />
              </div>
            ) : (
              <CreateAssistantNameForm
                isTrial={true}
                onSuccess={handleSuccess}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
