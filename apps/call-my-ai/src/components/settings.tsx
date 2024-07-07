"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Copy, XCircle } from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateUserHandle } from "@/app/(dashboard)/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Updating..." : "Update"}
    </Button>
  )
}

export default function Settings({
  user,
}: {
  user: { id: string; username: string | null }
}) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      setError(null)
      setSuccess(null)

      const result = await updateUserHandle(user.id, formData)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(result.success)
        router.refresh()
      }
    },
    [user.id, router]
  )

  const copyToClipboard = useCallback(() => {
    if (typeof window !== "undefined" && user?.username) {
      const currentDomain = process.env["NEXT_PUBLIC_APP_URL"]
      const handle = `${currentDomain}/${user.username}`
      navigator.clipboard
        .writeText(handle)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000) // Reset copied state after 2 seconds
        })
        .catch((err) => {
          console.error("Failed to copy: ", err)
        })
    }
  }, [user?.username])

  return (
    <form action={handleSubmit} className="w-full">
      <div className="w-full space-y-5 text-lg">
        <h2 className="font-inter text-3xl font-extrabold tracking-tight sm:text-3xl">Your Call Handle</h2>
        <div className="flex w-full items-center ">
          <div className="dark:border-white flex w-full items-center rounded-md border-2 border-slate-900">
            <span className="bg-primary px-2 py-3 text-primary-foreground">
              callmyai.com/
            </span>
            <Input
              id="username"
              name="username"
              placeholder="Enter your handle here"
              defaultValue={user?.username || ""}
              className="flex-1 rounded-none border-none px-2 py-3 text-lg focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {success && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ rotate: 360, scale: 1 }}
                className="mx-2 font-extrabold"
              >
                <CheckCircle size={25} className="text-green-500" />
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ rotate: 360, scale: 1 }}
                className="mx-2 font-extrabold"
              >
                <XCircle size={25} className="text-destructive" />
              </motion.div>
            )}
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ rotate: 360, scale: 1 }}
            className="mx-2 font-extrabold"
          >
            <Button
              variant={"ghost"}
              size="icon"
              type="button"
              onClick={(e) => {
                e.preventDefault()
                copyToClipboard()
              }}
              title={copied ? "Copied!" : "Copy to clipboard"}
            >
              {copied ? (
                <>
                  <CheckCircle
                    size={25}
                    className={copied ? "text-green-500" : ""}
                  />
                </>
              ) : (
                <>
                  <Copy size={25} className={copied ? "text-green-500" : ""} />
                </>
              )}
            </Button>
          </motion.div>
        </div>

        {error && <p className=" text-destructive">{error}</p>}
        <SubmitButton />
      </div>
    </form>
  )
}
