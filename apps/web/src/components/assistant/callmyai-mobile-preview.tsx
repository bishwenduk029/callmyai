"use client"

import * as React from "react"
import Image from "next/image"

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

interface CallMyAiMobilePreviewProps {
  assistantId: string
  title?: string
}

export function CallMyAiMobilePreview({
  assistantId,
  title = "CallMyAI Voice Assistant Preview",
}: CallMyAiMobilePreviewProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <div className="top-50 fixed right-5 h-5/6 w-1/4">
        <AssistantIframe assistantId={assistantId} />
      </div>
    )
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="h-15 w-full">
          <Avatar className="m-2">
            <Image
              src="https://fal.media/files/zebra/Xmqc2PO33YrOLwztHSE_G.png"
              alt="Avatar"
              width={48}
              height={48}
            />
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
