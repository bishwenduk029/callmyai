"use client"

import { createAssistant, TrialAssistant } from "@/actions/assistant"
import { zodResolver } from "@hookform/resolvers/zod"
import { Sparkle } from "@phosphor-icons/react/dist/ssr"
import { useAction } from "next-safe-action/hooks"
import { Controller, FormProvider, useForm } from "react-hook-form"
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
import AIDescriptionInput from "./ai-description-input"

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
          name: values.name,
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
                role: "system",
                content:
                  selectedPersona?.systemPrompt?.replace(
                    /\${name}/g,
                    values.name!
                  ) || "Hello! How can I help you today?",
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
          name: values.name,
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
                role: "system",
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
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="z-20 w-full space-y-4"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className={`flex-1 space-y-4 ${
            isTrial
              ? "text-foreground dark:bg-background/5 dark:text-foreground"
              : "p-2 text-foreground dark:bg-background/5"
          }`}>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Persona and Name group */}
              <div className="flex-1 space-y-6">
                <div>
                  <label htmlFor="persona" className="my-1 block font-semibold">
                    Choose Persona
                  </label>
                  <p className="text-muted-background mb-3 mt-1 dark:text-muted-foreground">
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
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <label htmlFor="name" className="my-1 block font-semibold">
                    Name
                  </label>
                  <p className="text-muted-background dark:text-muted-background mb-3 mt-1 dark:text-muted-foreground">
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
              </div>
            </div>

            {/* Description and Voice group */}
            <div className="space-y-8">
              <div>
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <AIDescriptionInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {form.formState.errors.description && (
                  <p className="text-lg text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label htmlFor="voice" className="my-1 block font-semibold">
                  Voices
                </label>
                <p className="text-muted-background mb-3 mt-1 dark:text-muted-foreground">
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
                              Math.floor(
                                Math.random() * matchingProfiles.length
                              )
                            ]

                          form.setValue("voice", value)
                          form.setValue("gender", selectedVoice.gender)
                          form.setValue("avatar", randomProfile?.source || "")
                          form.setValue(
                            "ethnicity",
                            randomProfile?.ethnicity || ""
                          )
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
            </div>
          </div>

          {/* Avatar section */}
          <div className="flex items-center justify-center lg:w-1/3">
            <Avatar
              className={`${isTrial ? "h-48 w-48" : "h-32 w-32"} flex-shrink-0`}
            >
              <AvatarImage src={form.watch("avatar")} alt="@assistant" />
              <AvatarFallback>BOT</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="mt-8 text-center">
          <SubmitButton
            className="w-full sm:w-auto"
            size={"lg"}
            isDisabled={false}
            isSubmitting={false}
          >
            <Sparkle className="mr-2 h-5 w-5" />
            Create New Voice Agent
          </SubmitButton>
        </div>
      </form>
    </FormProvider>
  )
}
