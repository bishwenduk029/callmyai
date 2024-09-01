"use client"

import { createAssistant } from "@/actions/assistant"
import { getUserByEmail } from "@/actions/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useToast } from "@/hooks/use-toast"
import auth from "@/lib/auth"

import { Input } from "../ui/input"
import { SubmitButton } from "../ui/submit-button"

const assistantNameSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Your name must be at least 4 characters long." }),
})

export function CreateAssistantNameForm() {
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(assistantNameSchema),
    defaultValues: { name: "" },
  })

  const createAssistantAction = useAction(createAssistant, {
    onSuccess: (result) => {
      if (result?.data?.error) {
        toast({
          title: "Error creating assistant",
          description: result?.data?.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Assistant Created",
          description: result?.data?.error,
        })
      }
    },
    onError: (error) => {
      console.log(error)
      toast({
        title: "Error creating assistant",
        description: "We encountered some error when creating your assistant.",
      })
    },
  })

  const onSubmit = async (values: z.infer<typeof assistantNameSchema>) => {
    createAssistantAction.execute({
      name: values.name,
      duration: 0, // Default duration,
      config: {
        llm: {
          model: {
            name: "gpt-4-turbo",
            provider: "openai",
          },
          messages: [],
        },
        tts: {
          provider: "openai",
          voice: "nova",
          metadata: {},
        },
      }, // Default config
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full" {...form}>
      <Input
        id="name"
        {...form.register("name")}
        placeholder="Enter your preferred name"
        className="mb-4 w-full px-2 py-3"
      />
      {form.formState.errors && (
        <p className="text-sm text-destructive">
          {form.formState.errors.name?.message}
        </p>
      )}
      <SubmitButton
        isDisabled={false}
        isSubmitting={createAssistantAction.isExecuting}
      >
        Create
      </SubmitButton>
    </form>
  )
}
