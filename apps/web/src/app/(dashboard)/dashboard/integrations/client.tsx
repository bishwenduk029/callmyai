"use client"

import Link from "next/link"
import { createIntegration, ExternalApp } from "@/actions/integration"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Gear,
  Headset,
  PhoneIncoming,
  PlugsConnected,
  PlusCircle,
} from "@phosphor-icons/react"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Integration } from "@/db/schema"

import { useToast } from "@/hooks/use-toast"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { SubmitButton } from "@/components/ui/submit-button"
import { AnimatedIconButton } from "@/components/animated/plus-icon"
import UpdateIntegrationForm from "@/components/integrations/update-integration-form"
import { LinearCombobox } from "@/components/linear-combobox"
import { useState } from "react"

const integrationCreateSchema = z.object({
  userId: z.string(),
  connectedAccountName: z.string(),
  availableActions: z.array(z.string()).optional(),
  appId: z.string(),
  key: z.string(),
  description: z.string().optional(),
  logo: z.string().optional(),
})

interface IntegrationsClientProps {
  userEmail: string
  userId: string
  integrations: Integration[]
}

export default function IntegrationsClient({
  userEmail,
  userId,
  integrations,
}: IntegrationsClientProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(integrationCreateSchema),
    defaultValues: {
      connectedAccountName: "",
      availableActions: [],
      userId: userId,
      appId: "",
      key: "",
      description: "",
      logo: "",
    },
  })

  const executeCreateIntegrationAction = useAction(createIntegration, {
    onSuccess: (result) => {
      setIsSubmitting(false)
      if (result.data?.success) {
        toast({
          title: "Integration Created",
          description: "The integration was successfully created.",
        })
        form.reset() // Reset the form after successful submission
      } else {
        toast({
          title: "Error Creating Integration",
          description: result.data?.error || "An unexpected error occurred.",
          variant: "destructive",
        })
      }
    },
    onError: (error) => {
      setIsSubmitting(false)
      console.error("Error creating integration:", error)
      toast({
        title: "Error",
        description: "Failed to create integration. Please try again.",
        variant: "destructive",
      })
    },
  })

  const onSubmit = async (values: z.infer<typeof integrationCreateSchema>) => {
    if (isSubmitting) return // Prevent double submission

    setIsSubmitting(true)
    executeCreateIntegrationAction.execute({
      connectedAccountName: values.connectedAccountName,
      availableActions: values.availableActions,
      userId: userId,
      appId: values.appId,
      key: values.key,
      description: values.description,
      logo: values.logo,
    })
  }

  return (
    <>
      <nav className="text-md mx-3 mt-3 hidden max-h-5 gap-4 text-muted-foreground sm:grid">
        <Link
          href="/dashboard/settings"
          className="flex items-center text-primary hover:underline"
        >
          <Gear className="mr-2 h-5 w-5" />
          Settings
        </Link>
        <Link
          href="/dashboard/calls"
          className="flex items-center text-primary hover:underline"
        >
          <PhoneIncoming className="mr-2 h-5 w-5" />
          Calls
        </Link>
        <Link
          href="/dashboard/assistants"
          className="flex items-center text-primary hover:underline"
        >
          <Headset className="mr-2 h-5 w-5" />
          Assistants
        </Link>
        <Link
          href="/dashboard/integrations"
          className="flex items-center font-semibold text-primary hover:underline"
        >
          <PlugsConnected className="mr-2 h-5 w-5" weight="bold" />
          Integrations
        </Link>
      </nav>
      <div className="flex w-full flex-col flex-wrap">
        <Dialog>
          <DialogTrigger asChild>
            <AnimatedIconButton
              className="mb-4 ml-auto"
              iconPlacement="left"
              IconComponent={<PlusCircle size={20} weight="bold" />}
            >
              <span className="ml-2">Add New Integration</span>
            </AnimatedIconButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
              <DialogDescription>
                Connect a new external account to enhance your assistant's
                capabilities.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="connectedAccountName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Select an External Account
                </label>
                <LinearCombobox
                  userEmail={userEmail}
                  onLinkGenerated={(app: ExternalApp) => {
                    form.setValue("connectedAccountName", app.name)
                    form.setValue("appId", app.appId)
                    form.setValue("key", app.key)
                    form.setValue("description", app.description)
                    form.setValue("logo", app.logo)
                  }}
                />
              </div>
              <Separator />
              <SubmitButton
                isSubmitting={isSubmitting || executeCreateIntegrationAction.isExecuting}
                disabled={isSubmitting || executeCreateIntegrationAction.isExecuting}
              >
                Create Integration
              </SubmitButton>
            </form>
          </DialogContent>
        </Dialog>
        <div className="flex flex-col gap-4 container mb-4">
          {integrations?.map((integration: Integration) => (
            <UpdateIntegrationForm
              integrationId={integration.id}
              appName={integration.connectedAccountName}
              currentActions={integration.availableActions}
              key={integration.key}
              description={integration.description}
              logo={integration.logo}
            />
          ))}
        </div>
      </div>
    </>
  )
}
