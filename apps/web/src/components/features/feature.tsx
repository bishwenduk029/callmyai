"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { FeatureProps } from "@/types/features"

export function Feature({ title, description, index }: FeatureProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "group/feature dark:border-neutral-800 relative z-0 flex flex-col py-10 font-urbanist lg:border-r",
        (index === 0 || index === 4) && "dark:border-neutral-800 lg:border-l",
        index < 4 && "dark:border-neutral-800 lg:border-b"
      )}
    >
      <GradientOverlay index={index} />
      <div 
        className="relative z-10 mb-2 px-10 text-lg font-bold"
        role="heading"
        aria-level={3}
      >
        <div className="dark:bg-neutral-700 absolute inset-y-0 left-0 h-6 w-1 origin-center rounded-br-full rounded-tr-full bg-neutral-300 transition-all duration-200 group-hover/feature:h-8 group-hover/feature:bg-green-500" />
        <span className="dark:text-primary inline-block text-primary transition duration-200 group-hover/feature:translate-x-2">
          {title}
        </span>
      </div>
      <p className="text-md relative z-10 max-w-xs px-10 text-muted-foreground">
        {description}
      </p>
    </motion.div>
  )
}

function GradientOverlay({ index }: { index: number }) {
  if (index < 4) return (
    <div className="dark:from-primary-800 from-primary-100 pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-t to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100" />
  )
  
  return (
    <div className="dark:from-primary-800 from-primary-100 pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-b to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100" />
  )
} 