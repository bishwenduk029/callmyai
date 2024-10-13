"use client"

import { RtviConfig, updateAssistantConfig } from "@/actions/assistant"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useToast } from "@/hooks/use-toast"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Assistant } from "../../db/schema/index"
import { SubmitButton } from "../ui/submit-button"
import { Textarea } from "../ui/textarea"
import auth from "@/lib/auth"
import { getUserByEmail } from "@/actions/user"
import { redirect } from "next/navigation"

interface AssistantSystemPromptFormProps {
  assistant: Assistant
  config: RtviConfig | {}
}

const systemPromptSchema = z.object({
  systemPrompt: z
    .string()
    .min(10, { message: "System prompt must be at least 10 characters long." }),
})

export function AssistantSystemPromptForm({
  assistant,
  config,
}: AssistantSystemPromptFormProps) {
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(systemPromptSchema),
    defaultValues: {
      // @ts-ignore
      systemPrompt: config?.llm?.messages[0]?.content || "",
    },
  })

  const updateConfigAction = useAction(updateAssistantConfig, {
    onSuccess: (result) => {
      if (result?.data?.error) {
        toast({
          title: "Error updating system prompt",
          description: result?.data?.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "System Prompt Updated",
          description: "The system prompt has been updated successfully.",
        })
      }
    },
    onError: (error) => {
      console.log(error)
      toast({
        title: "Error updating system prompt",
        description:
          "We encountered some error when updating the system prompt.",
      })
    },
  })

  const onSubmit = async (values: z.infer<typeof systemPromptSchema>) => {
    const updatedConfig = {
      llm: {
        // @ts-ignore
        ...config!.llm,
        messages: [
          {
            role: "system",
            content: values.systemPrompt,
          },
        ],
      },
      tts: {
        // @ts-ignore
        ...config!.tts,
        provider: "elevenlabs",
        voice: "default",
        metadata: { voice: "default" },
      },
    }

    updateConfigAction.execute({
      assistantId: assistant.id,
      config: updatedConfig,
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>System Prompt</CardTitle>
          <CardDescription>
            Enter the system prompt for your assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="systemPrompt"
            {...form.register("systemPrompt")}
            placeholder="Enter the system prompt"
            className="mb-4 w-full px-2 py-3"
          />
          {form.formState.errors && (
            <p className="text-sm text-destructive">
              {/* @ts-ignore */}
              {form.formState.errors.systemPrompt?.message}
            </p>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <SubmitButton
            isDisabled={false}
            isSubmitting={updateConfigAction.isExecuting}
          >
            Save Prompt
          </SubmitButton>
        </CardFooter>
      </Card>
    </form>
  )
}
