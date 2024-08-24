"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import Balancer from "react-wrap-balancer"

import { cn } from "@/lib/utils"

import { buttonVariants } from "@/components/ui/button"

const FADE_DOWN_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" } },
}

export function HeroSection() {
  const ref = useRef(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <motion.div
      id="hero-section"
      initial={{ opacity: 0.5, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
      aria-label="hero section"
      className="md:mt-38 mx-auto mt-16 w-full sm:w-1/2"
    >
      <Image
        fill
        src="/images/radial_1.svg"
        alt="Hero top right corner radial light effect"
        className="absolute right-0 top-0 opacity-5 lg:opacity-10"
        priority
      />

      <div className="container mx-auto flex flex-col items-center gap-6 text-center">
        <h1 className="font-urbanist text-5xl font-extrabold sm:text-6xl">
          AI powered Call Assistant{" "}
          <span className="bg-clip-text underline">in seconds</span>
        </h1>

        <motion.h3
          className="max-w-2xl font-urbanist text-muted-foreground sm:text-xl sm:leading-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <Balancer>
            Create AI-powered voice assistants for multiple roles:
            receptionists, customer support, and more. Never miss a call and
            boost conversions with human-like interactions.
          </Balancer>
        </motion.h3>

        <motion.div
          className="z-10 flex flex-col justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <Link
            href="/dashboard/settings"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Get Your AI Call Assistant Now
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
