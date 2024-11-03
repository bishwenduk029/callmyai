'use client'

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Share } from "@phosphor-icons/react"

interface ShareButtonProps {
  value: string
  className?: string
}

export function ShareButton({ value, className }: ShareButtonProps) {
  const { toast } = useToast()

  function handleShare() {
    navigator.clipboard.writeText(value)
    toast({
      title: "Link copied!",
      description: "The assistant link has been copied to your clipboard.",
    })
  }

  return (
    <Button 
      onClick={handleShare} 
      variant="default" 
      className={className}
    >
      <Share className="mr-2 h-4 w-4" />
      Share
    </Button>
  )
} 