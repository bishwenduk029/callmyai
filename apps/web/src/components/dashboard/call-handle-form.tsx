import { updateUserByCallHandle } from "@/actions/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { Copy } from "@phosphor-icons/react"
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

import { User } from "../../db/schema/index"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { SubmitButton } from "../ui/submit-button"

interface CallHandleFormProps {
  user: User
}

const callHandleFormSchema = z.object({
  username: z
    .string()
    .min(4, { message: "Username must be at least 4 characters long." }),
})

const currentDomain = process.env["NEXT_PUBLIC_APP_URL"]

export default function CallHandleForm({ user }: CallHandleFormProps) {
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(callHandleFormSchema),
    defaultValues: { username: user.username || "" },
  })

  const updateUser = useAction(updateUserByCallHandle, {
    onSuccess: (result) => {
      if (result?.data?.error) {
        toast({
          title: "Error Updating Call Handle",
          description: result?.data?.error,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Call Handle Updated",
          description: result?.data?.message,
        })
      }
    },
    onError: (error) => {
      console.log(error)
      toast({
        title: "Call Handle Update Failed",
        description: "Your call handle was not updated",
      })
    },
  })

  const onSubmit = async (values: z.infer<typeof callHandleFormSchema>) => {
    updateUser.execute({
      id: user.id,
      username: values.username,
    })
  }

  const copyToClipboard = async () => {
    if (typeof window !== "undefined" && user.username) {
      const handle = `${currentDomain}/${user.username}`
      try {
        await navigator.clipboard.writeText(handle)
        toast({ title: "Copied!", description: "Handle copied to clipboard." })
      } catch (err) {
        console.error("Failed to copy: ", err)
      }
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full" {...form}>
      <Card>
        <CardHeader>
          <CardTitle>Your Call Handle</CardTitle>
          <CardDescription>
            Used to identify your handle in the CallMyAI service.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex w-full items-center rounded-md border-2 border-slate-900">
            <span className="text-sm sm:text-lg bg-primary px-2 py-3 text-primary-foreground">
              callmyai.com/
            </span>
            <Input
              id="username"
              {...form.register("username")}
              placeholder="Enter your handle here"
              className="text-sm sm:text-lg flex-1 rounded-none border-none px-2 py-3 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={copyToClipboard}
              className="ml-4"
            >
              <Copy size={25} />
            </Button>
          </div>
          {form.formState.errors && (
            <p className="text-sm text-destructive">
              {form.formState.errors.username?.message}
            </p>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <SubmitButton isSubmitting={updateUser.isExecuting}>
            Save Handle
          </SubmitButton>
        </CardFooter>
      </Card>
    </form>
  )
}
