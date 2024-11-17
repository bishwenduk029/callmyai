"use client"

import { createAssistant, TrialAssistant } from "@/actions/assistant"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useToast } from "@/hooks/use-toast"
import { personas } from "@/lib/personas"
import { profiles } from "@/lib/profiles"
import { voices } from "@/lib/voices"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { SubmitButton } from "../ui/submit-button"

interface FalResult {
  images?: { url: string }[]
}

const assistantNameSchema = z.object({
  persona: z.string().min(1, { message: "Please select a persona." }),
  name: z
    .string()
    .min(2, { message: "Your name must be at least 4 characters long." }),
  description: z // Changed from header to description
    .string()
    .min(2, { message: "Description must be at least 2 characters long." }),
  avatar: z.string().optional(),
  ethnicity: z.string().optional(),
  voice: z.string().min(1, { message: "Please select a voice." }),
  gender: z.string().optional(),
})

export function CreateAssistantNameForm({
  onSuccess,
  isTrial,
}: {
  onSuccess?: (assistant: TrialAssistant) => void
  isTrial: boolean
}) {
  const { toast } = useToast()

  // Initialize with default values from the first voice
  const defaultVoice = voices[0]
  const defaultProfile = profiles.find((p) => p.gender === defaultVoice?.gender)

  const form = useForm({
    resolver: zodResolver(assistantNameSchema),
    defaultValues: {
      persona: "",
      name: "",
      description: "", // Changed from header to description
      avatar: defaultProfile?.source || "",
      ethnicity: defaultProfile?.ethnicity || "",
      voice: defaultVoice?.id || "",
      gender: defaultVoice?.gender || "",
    },
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
          description: "Your assistant has been created successfully.",
        })
      }
    },
    onError: (error) => {
      console.log(error)
      toast({
        title: "Error creating assistant",
        description: "We encountered some error when creating your assistant.",
        variant: "destructive",
      })
    },
  })

  const onSubmit = async (values: z.infer<typeof assistantNameSchema>) => {
    const selectedPersona = personas.find((p) => p.role === values.persona)
    const selectedVoice = voices.find((v) => v.id === values.voice)

    if (!isTrial) {
      createAssistantAction.execute({
        name: values.name,
        duration: 300, // Default duration in seconds
        config: {
          header: values.name,
          description: values.description,
          gender: values.gender,
          ethnicity: values.ethnicity,
          avatar: values.avatar,
          tools: [],
          llm: {
            model: {
              name: "gpt-4-turbo",
              provider: "openai",
            },
            messages: [
              {
                role: "assistant",
                content:
                  values.description +
                  "\n " +
                  (selectedPersona?.systemPrompt?.replace(
                    /\${name}/g,
                    values.name!
                  ) || "Hello! How can I help you today?"),
              },
            ],
          },
          tts: {
            provider: selectedVoice?.provider || "openai",
            voice: values.voice,
          },
        },
      })
    } else {
      onTrialSubmit(values)
    }
  }

  const onTrialSubmit = async (values: z.infer<typeof assistantNameSchema>) => {
    const selectedPersona = personas.find((p) => p.role === values.persona)
    const selectedVoice = voices.find((v) => v.id === values.voice)

    toast({
      title: "Assistant Created",
    })

    if (onSuccess) {
      onSuccess({
        id: new Date().toISOString(),
        name: values.name,
        config: {
          header: values.name,
          description: values.description,
          gender: values.gender,
          ethnicity: values.ethnicity,
          avatar: values.avatar,
          tools: [],
          llm: {
            model: {
              name: "gpt-4o-mini",
              provider: "openai",
            },
            messages: [
              {
                role: "assistant",
                content:
                  values.description +
                  "\n " +
                  (selectedPersona?.systemPrompt?.replace(
                    /\${name}/g,
                    values.name!
                  ) || "Hello! How can I help you today?"),
              },
            ],
          },
          tts: {
            provider: selectedVoice?.provider || "openai",
            voice: values.voice,
          },
        },
      })
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)} // Changed from onTrialSubmit to onSubmit
      className="z-20 w-full space-y-10"
      {...form}
    >
      <div className={isTrial ? "space-y-4 p-2 text-foreground dark:bg-background/5" : "space-y-4 p-2 text-foreground dark:bg-background/5"}>
        <div>
          <label
            htmlFor="persona"
            className="my-1 block text-xl font-semibold"
          >
            Choose Persona
          </label>
          <p className="text-md mb-3 mt-1 text-muted-foreground">
            What is the role of your CallMyAI Agent
          </p>
          <Select
            onValueChange={(value) => {
              form.setValue("persona", value)
            }}
            value={form.watch("persona")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a persona" />
            </SelectTrigger>
            <SelectContent>
              {personas.map((persona) => (
                <SelectItem key={persona.role} value={persona.role}>
                  {persona.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.persona && (
            <p className="text-lg text-destructive">
              {form.formState.errors.persona.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="name"
            className="my-1 block text-xl font-semibold"
          >
            Name
          </label>
          <p className="text-md mb-3 mt-1 text-muted-foreground">
            Enter the name of your CallMyAI Agent
          </p>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="Enter your preferred name"
            className="w-full px-2 py-3"
          />
          {form.formState.errors.name && (
            <p className="text-lg text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="description"
            className="my-1 block text-lg font-semibold"
          >
            Description
          </label>
          <p className="text-md mb-3 mt-1 text-muted-foreground">
            Add business context and brief details about your AI agent
          </p>
          <Input
            id="description"
            {...form.register("description")}
            placeholder="Add business context like name of your company, services offered, etc."
            className="w-full px-2 py-3"
          />
          {form.formState.errors.description && (
            <p className="text-lg text-destructive">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>
        <div className="flex flex-col justify-center gap-6 align-baseline sm:flex-row sm:items-center">
          <Avatar
            className={` ${isTrial ? "h-48 w-48" : "h-32 w-32"} flex-shrink-0`}
          >
            <AvatarImage
              src={form.watch("avatar")} // Change getValues to watch
              alt="@assistant"
            />
            <AvatarFallback>BOT</AvatarFallback>
          </Avatar>
        </div>
        <div className="w-full">
          <label
            htmlFor="voice"
            className="my-1 block text-lg font-semibold"
          >
            Voices
          </label>
          <p className="text-md mb-3 mt-1 text-muted-foreground">
            Select the voice for your CallMyAI Agent
          </p>
          <Select
            onValueChange={(value) => {
              try {
                const selectedVoice = voices.find((v) => v.id === value)
                if (selectedVoice?.gender) {
                  const matchingProfiles = profiles.filter(
                    (p) => p.gender === selectedVoice.gender
                  )
                  if (matchingProfiles.length > 0) {
                    const randomProfile =
                      matchingProfiles[
                        Math.floor(Math.random() * matchingProfiles.length)
                      ]

                    form.setValue("voice", value)
                    form.setValue("gender", selectedVoice.gender)
                    form.setValue("avatar", randomProfile?.source || "")
                    form.setValue("ethnicity", randomProfile?.ethnicity || "")
                  }
                }
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to update assistant appearance",
                  variant: "destructive",
                })
              }
            }}
            value={form.watch("voice")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name} - {voice.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.voice && (
            <p className="text-lg text-destructive">
              {form.formState.errors.voice.message}
            </p>
          )}
        </div>
        <SubmitButton
          className="w-full"
          isDisabled={false}
          isSubmitting={false}
        >
          Create New Assistant
        </SubmitButton>
      </div>
    </form>
  )
}
