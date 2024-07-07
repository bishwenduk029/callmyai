"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import Balancer from "react-wrap-balancer"

import { siteConfig } from "@/config/site"

import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"

const FADE_DOWN_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" } },
}

export function HeroSection() {
  const gitHubStars = 0
  const ref = useRef(null)
  const isInView = useInView(ref)

  return (
    <motion.div
      id="hero-section"
      aria-label="hero section"
      className="md:mt-38 mx-auto mt-16 w-full sm:w-1/2"
    >
      <Image
        fill
        src="/images/radial_1.svg"
        alt="Hero top right corenr radial light effect"
        className="absolute right-0 top-0 opacity-5 lg:opacity-10"
      />

      <motion.div
        initial="hidden"
        ref={ref}
        animate={isInView ? "show" : "hidden"}
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
        className="container mx-auto flex flex-col items-center gap-6 text-center"
      >
        {gitHubStars ? (
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="z-10"
          >
            <Badge
              variant="outline"
              aria-hidden="true"
              className="rounded-md px-3.5 py-1.5 text-sm transition-all duration-1000 ease-out hover:opacity-80 md:text-base md:hover:-translate-y-2"
            >
              <Icons.gitHub className="mr-2 size-3.5" aria-hidden="true" />
              {gitHubStars} Stars on GitHub
            </Badge>
            <span className="sr-only">GitHub</span>
          </Link>
        ) : null}
        <motion.h1
          variants={FADE_DOWN_ANIMATION_VARIANTS}
          className="font-urbanist text-5xl font-extrabold tracking-tight sm:text-6xl"
        >
          <Balancer>
            AI powered answering machine{" "}
            <motion.span
              variants={FADE_DOWN_ANIMATION_VARIANTS}
              className="bg-clip-text underline "
            >
              on web
            </motion.span>
          </Balancer>
        </motion.h1>

        <motion.h3
          variants={FADE_DOWN_ANIMATION_VARIANTS}
          className="max-w-2xl font-urbanist text-muted-foreground sm:text-xl sm:leading-8"
        >
          <Balancer>
            Your own call assistant. Ready to take calls on your behalf and filter out spams, unwanted calls and more.
          </Balancer>
        </motion.h3>

        <motion.div
          variants={FADE_DOWN_ANIMATION_VARIANTS}
          className="z-10 flex flex-col justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/dashboard/settings"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Get Your Handle
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
