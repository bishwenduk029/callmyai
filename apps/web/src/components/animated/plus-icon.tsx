"use client"

import * as React from "react"
import { IconProps } from "@phosphor-icons/react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

import { Button, ButtonProps } from "@/components/ui/button"

interface AnimatedIconButtonProps extends ButtonProps {
  iconSize?: number
  iconPlacement?: "left" | "right"
  IconComponent?: React.ReactElement<IconProps>
}

export function AnimatedIconButton({
  iconSize = 20,
  iconPlacement = "left",
  IconComponent,
  children,
  className,
  ...props
}: AnimatedIconButtonProps) {
  const iconVariants = {
    initial: { x: 0 },
    hover: { x: [-40, -5, 0] },
  }

  const iconElement = IconComponent && (
    <motion.span
      className="inline-flex items-center justify-center"
      variants={iconVariants}
      transition={{ duration: 0.5, ease: "linear" }}
    >
      {IconComponent}
    </motion.span>
  )

  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      className={cn("flex items-center gap-2", className)}
    >
      <Button {...props} className="w-full sm:w-auto">
        {iconPlacement === "left" && iconElement}
        <span>{children}</span>
        {iconPlacement === "right" && iconElement}
      </Button>
    </motion.div>
  )
}
