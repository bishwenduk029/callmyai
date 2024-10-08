"use client"

import * as React from "react"
import { Mailbox } from "@phosphor-icons/react/dist/ssr"

import { useMediaQuery } from "@/hooks/use-media"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import { Avatar, AvatarImage } from "../ui/avatar"
import { AssistantIframe } from "./assistant-iframe"
import Image from "next/image"

interface CallMyAiMobilePreviewProps {
  assistantId: string
  title?: string
}

export function CallMyAiMobilePreview({
  assistantId,
  title = "CallMyAI Voice Assistant Preview",
}: CallMyAiMobilePreviewProps) {
  const isDesktop = useMediaQuery("(min-width: 1280px)")

  if (isDesktop)
    return (
      <div className="top-50 fixed right-5 h-3/4 w-1/4">
        <AssistantIframe assistantId={assistantId} />
      </div>
    )

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full h-15">
          <Avatar className="m-2">
            <Image src="https://fal.media/files/zebra/Xmqc2PO33YrOLwztHSE_G.png" alt="Avatar" width={48} height={48} />
          </Avatar>
          {title}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="container h-[750px] w-full">
          <DrawerHeader className="text-center">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <AssistantIframe assistantId={assistantId} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
