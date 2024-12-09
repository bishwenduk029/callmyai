"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons"

import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

import { Button, type ButtonProps } from "@/components/ui/button"

const CopyButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  ButtonProps & { value: string; display?: string }
>(({ value, display, className, ...props }, ref) => {
  const [isCopied, setIsCopied] = React.useState(false)
  const { toast } = useToast()

  const handleCopy = () => {
    if (typeof window === "undefined") return
    setIsCopied(true)
    void window.navigator.clipboard.writeText(value)
    toast({
      title: "Link copied!",
      description:
        display && `${display}'s link has been copied to your clipboard.`,
    })
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      className={cn("px-0", className)}
      onClick={handleCopy}
      {...props}
    >
      {isCopied ? (
        <CheckIcon className="size-3" aria-hidden="true" />
      ) : (
        <CopyIcon className="size-3" aria-hidden="true" />
      )}
      <span className="sr-only">
        {isCopied ? "Copied" : "Copy to clipboard"}
      </span>
    </Button>
  )
})
CopyButton.displayName = "CopyButton"

export { CopyButton }
