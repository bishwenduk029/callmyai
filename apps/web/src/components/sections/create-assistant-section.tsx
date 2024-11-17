"use client"
import { useState } from "react"
import { CreateAssistantNameForm } from "../assistant/create-assistant-name-form"
import { Card } from "../ui/card"
import FlickeringGrid from "../ui/flickering-grid"
import { Meteors } from "../ui/meteors"
import RetroGrid from "../ui/retro-grid"
import { Section } from "../ui/section"
import { Vortex } from "../ui/vortex"
import DemoCallMyAIAgent from "../demo-callmyai-agent"
import { Assistant } from "@/db/schema"
import { TrialAssistant } from "@/actions/assistant"

export function CreateAssistantSection() {
  const [createdAssistant, setCreatedAssistant] = useState<TrialAssistant | null>(null)

  const handleSuccess = (assistant: TrialAssistant) => {
    setCreatedAssistant(assistant)
  }

  return (
    <Section className="overflow-hidden font-inter">
      <div className="max-w-container mx-auto flex flex-col gap-6 sm:gap-12">
        <div className="flex flex-col items-center gap-4 text-center sm:gap-8">
          <h2 className="animate-appear inline-block bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text font-heading text-4xl font-semibold leading-tight text-transparent drop-shadow-2xl sm:text-5xl sm:leading-tight">
            Create CallMyAI voice agents that sound like humans
          </h2>
          <p className="animate-appear font-urbanist text-lg font-medium text-muted-foreground opacity-0 delay-100 sm:text-xl">
            Customize your AI assistant with natural voices and personalities
          </p>
        </div>
        <div className="relative mx-auto flex w-full h-[800px] min-h-xl max-w-xl flex-col items-center justify-center overflow-hidden rounded-2xl border border-foreground/35 p-2">
        
          <Vortex
            backgroundColor="black"
            rangeY={800}
            particleCount={100}
            baseHue={120}
            className="flex h-full w-full flex-col items-center justify-center px-2 py-4 md:px-10"
          >
            <div className="w-full text-center mb-1">
              <h3 className="text-xl font-semibold text-white mb-2">Quick Demo</h3>
            </div>
            {createdAssistant ? (
              <DemoCallMyAIAgent trialAssistant={createdAssistant} />
            ) : (
              <CreateAssistantNameForm onSuccess={handleSuccess} />
            )}
          </Vortex>
        </div>
      </div>
    </Section>
  )
}
