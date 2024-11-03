"use client"

import Link from "next/link"
import { User } from "@/db/schema"


import CallHandleForm from "./call-handle-form"
import UserNameForm from "./username-form"
import { PhoneNumberForm } from "./phone-number-form"

interface SettingsProps {
  user: User
}

const currentDomain = process.env["NEXT_PUBLIC_APP_URL"]

export default function Settings({ user }: SettingsProps) {
  return (
    <div className="grid w-full gap-y-6">
      <CallHandleForm user={user} />

      <UserNameForm user={user} />
      <PhoneNumberForm user={user} />
      <Link
        className=" mx-auto text-sm font-normal text-primary underline-offset-4 transition-colors hover:underline"
        aria-label="Test/Preview Your AI Call Assistant"
        href={`${currentDomain}/${user.username}`}
        rel="noopener noreferrer"
      >
        Test/Preview Your AI Call Assistant
        <span className="sr-only">Test/Preview Your AI Call Assistant</span>
      </Link>
    </div>
  )
}
