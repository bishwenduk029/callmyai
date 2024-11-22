"use client"

import { useState } from "react"
import { TrialAssistant } from "@/actions/assistant"

import { CreateAssistantNameForm } from "../assistant/create-assistant-name-form"
import DemoCallMyAIAgent from "../demo-callmyai-agent"
import { Section } from "../ui/section"
import { Vortex } from "../ui/vortex"

export function CreateAssistantSection() {
  const [createdAssistant, setCreatedAssistant] =
    useState<TrialAssistant | null>(null)

  const handleSuccess = (assistant: TrialAssistant) => {
    setCreatedAssistant(assistant)
  }

  return (
    <Section className="font-urbanist overflow-hidden">
      <div className="mx-auto max-w-container grid gap-6 sm:gap-12 pb-8">
        <div className="flex flex-col items-center gap-4 text-center sm:gap-8">
          <h2 className="font-heading inline-block animate-appear bg-foreground bg-clip-text text-4xl font-semibold leading-tight text-transparent drop-shadow-2xl sm:text-5xl sm:leading-tight">
            Create AI voice agents that sound like humans
          </h2>
          <p className="font-urbanist animate-appear text-lg font-medium text-muted-foreground opacity-0 delay-100 sm:text-xl">
            Customize your AI assistant with natural voices and personalities
          </p>
        </div>
        <div className="min-h-xl relative mx-auto flex h-[800px] w-full max-w-xl flex-col items-center justify-center overflow-hidden rounded-2xl p-8">
          <Vortex
            backgroundColor="black"
            rangeY={800}
            particleCount={100}
            baseHue={120}
            className="flex h-full w-full flex-col items-center justify-center"
          >
            <div className="w-full text-center bg-black">
              <h3 className="text-xl font-semibold text-white">
                Quick Demo
              </h3>
            </div>
            <div className="flex-1 w-full flex items-center justify-center">
              {createdAssistant ? (
                <DemoCallMyAIAgent trialAssistant={createdAssistant} />
              ) : (
                <CreateAssistantNameForm
                  isTrial={true}
                  onSuccess={handleSuccess}
                />
              )}
            </div>
          </Vortex>
        </div>
      </div>
    </Section>
  )
}
