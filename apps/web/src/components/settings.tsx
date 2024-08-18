"use client"

import { ChangeEvent, useCallback, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { updateUserHandle } from "@/actions/user"
import { CheckCircle, Copy, XCircle } from "@phosphor-icons/react"
import { motion } from "framer-motion"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"

interface SettingsProps {
  user: { id: string; username: string | null; name: string | null }
}

const currentDomain = process.env["NEXT_PUBLIC_APP_URL"]

export default function Settings({ user }: SettingsProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isUsernameChanged, setIsUsernameChanged] = useState(false)
  const [isNameChanged, setIsNameChanged] = useState(false)
  const [username, setUsername] = useState(user?.username || "")
  const [name, setName] = useState(user?.name)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const formData = new FormData(event.currentTarget)
    formData.set("username", username)
    formData.set("name", name!)

    const result = await updateUserHandle(user.id, formData)

    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      setSuccess(result.success)
      router.refresh()
    }
    setIsUsernameChanged(false)
    setIsNameChanged(false)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    if (name === "username") {
      setUsername(value)
      setIsUsernameChanged(true)
    } else if (name === "name") {
      setName(value)
      setIsNameChanged(true)
    }
  }

  const copyToClipboard = useCallback(() => {
    if (typeof window !== "undefined" && username) {
      const handle = `${currentDomain}/${username}`
      navigator.clipboard
        .writeText(handle)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        .catch((err) => console.error("Failed to copy: ", err))
    }
  }, [username])

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Call Handle</CardTitle>
            <CardDescription>
              Used to identify your handle in the CallMyAI service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex w-full items-center rounded-md border-2 border-slate-900">
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
            </form>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={!isUsernameChanged}>
              {username ? "Save Handle" : "No changes"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={copyToClipboard}
              title={copied ? "Copied!" : "Copy to clipboard"}
              className="ml-4"
            >
              {copied ? (
                <CheckCircle size={25} className="text-green-500" />
              ) : (
                <Copy size={25} />
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Name</CardTitle>
            <CardDescription>
              Enter the name you want your AI call assistant to use when
              referring to you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Input
                id="name"
                name="name"
                placeholder="Enter your preferred name"
                value={name || ""}
                onChange={handleInputChange}
                className="mb-4 w-full px-2 py-3"
              />
              {error && <p className="text-destructive">{error}</p>}
            </form>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={!isNameChanged}>
              {name ? "Save Name" : "No changes"}
            </Button>
          </CardFooter>
        </Card>
        <div className="mx-auto box-content flex w-full justify-center">
          <Link
            href={`${currentDomain}/${username}`}
            className={`w-full ${buttonVariants({ variant: "default" })}`}
            rel="noopener noreferrer"
          >
            Test/Preview Your AI Call Assistant
          </Link>
        </div>
      </div>
    </form>
  )
}
