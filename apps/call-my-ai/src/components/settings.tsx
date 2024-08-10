"use client"

import { updateUserHandle } from "@/actions/user"
import { CheckCircle, Copy, XCircle } from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ChangeEvent, useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface SettingsProps {
  user: { id: string; username: string | null; systemPrompt: string | null }
}

interface PromptTemplate {
  id: string
  name: string
  content: string
}

export default function Settings({ user }: SettingsProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [username, setUsername] = useState(user?.username || "")
  const [systemPrompt, setSystemPrompt] = useState(user?.systemPrompt || "")
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const formData = new FormData(event.currentTarget)
    formData.set("username", username)
    formData.set("systemPrompt", systemPrompt)
    const result = await updateUserHandle(user.id, formData)

    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      setSuccess(result.success)
      router.refresh()
    }
    setIsInputChanged(false)
  }

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    if (name === "username") {
      setUsername(value)
    } else if (name === "systemPrompt") {
      setSystemPrompt(value)
    }
    setIsInputChanged(true)
  }

  const copyToClipboard = useCallback(() => {
    if (typeof window !== "undefined" && username) {
      const currentDomain = process.env["NEXT_PUBLIC_APP_URL"]
      const handle = `${currentDomain}/${username}`
      navigator.clipboard
        .writeText(handle)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        .catch((err) => {
          console.error("Failed to copy: ", err)
        })
    }
  }, [username])

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="w-full space-y-12 text-lg">
        <div className="space-y-2">
          <h2 className="font-inter text-3xl font-extrabold tracking-tight sm:text-3xl">
            Your Call Handle
          </h2>
          <div className="flex w-full items-center ">
            <div className="dark:border-white flex w-full items-center rounded-md border-2 border-slate-900">
              <span className="bg-primary px-2 py-3 text-primary-foreground">
                callmyai.com/
              </span>
              <Input
                id="username"
                name="username"
                placeholder="Enter your handle here"
                value={username}
                onChange={handleInputChange}
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
                onClick={copyToClipboard}
                title={copied ? "Copied!" : "Copy to clipboard"}
              >
                {copied ? (
                  <CheckCircle
                    size={25}
                    className={copied ? "text-green-500" : ""}
                  />
                ) : (
                  <Copy size={25} className={copied ? "text-green-500" : ""} />
                )}
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="font-inter text-3xl font-extrabold tracking-tight sm:text-3xl">
            System Prompt Template
          </h2>
          <Textarea
            id="systemPrompt"
            name="systemPrompt"
            placeholder="Enter your system prompt template here"
            value={systemPrompt}
            onChange={handleInputChange}
            className="w-full px-2 py-3 text-lg h-[50vh] min-h-[200px] resize-none border-primary border-2 overflow-y-auto"
            rows={4}
          />

          {error && <p className=" text-destructive">{error}</p>}
          <Button type="submit" disabled={!isInputChanged}>
            {isInputChanged ? "Update" : "No changes"}
          </Button>
        </div>
      </div>
    </form>
  )
}
