"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import Balancer from "react-wrap-balancer"
import Typewriter from "typewriter-effect"

import { env } from "@/env.mjs"

import { cn } from "@/lib/utils"

import { buttonVariants } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import HeroVideoDialog from "../ui/hero-video"
import { Input } from "../ui/input"
import ShimmerButton from "../ui/shimmer-button"

// Define the review data
const demos = [
  {
    comment: "Great AI assistant!",
    rating: 5,
    videoUrl: "https://www.youtube.com/embed/V7WlRzVM5e8",
    thumbnailSrc: "https://img.youtube.com/vi/V7WlRzVM5e8/0.jpg",
  },
  // {
  //   comment: "Impressive functionality!",
  //   rating: 4,
  //   videoUrl: "https://www.youtube.com/embed/QFEjLau5eI8",
  //   thumbnailSrc: "https://img.youtube.com/vi/QFEjLau5eI8/0.jpg",
  // },
  // Add more review objects as needed
]

export function HeroSection() {
  return (
    <div
      id="hero-section"
      aria-label="hero section"
      className="md:mt-38 mt-16 w-full"
    >
      <Image
        fill
        src="/images/radial_1.svg"
        alt="Hero top right corner radial light effect"
        className="absolute right-0 top-0 opacity-5 lg:opacity-10"
        priority
      />

      <div className="container flex w-full flex-col items-start gap-6 lg:flex-row">
        <motion.div
          className="w-full text-left lg:w-1/2"
          initial={{ opacity: 0.5, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h1 className="mb-4 font-heading text-5xl sm:text-6xl lg:text-7xl">
            AI Powered Voice Assistant{" "}
            <span className="bg-clip-text underline">in seconds</span>
          </h1>

          <motion.h3 className="mb-6 max-w-2xl font-urbanist text-lg text-muted-foreground sm:text-xl lg:text-2xl">
            <Balancer>
              Create AI-Powered voice assistants for multiple roles: <br />
              <span className="flex flex-row">
                <span>AI&nbsp;</span>
                <Typewriter
                  options={{
                    strings: [
                      "Receptionists",
                      "Customer Support Agents",
                      "Personal Assistant",
                      "Knowledge Expert",
                    ],
                    autoStart: true,
                    loop: true,
                    delay: 50, // Add a 1-second delay
                  }}
                />
              </span>
            </Balancer>
          </motion.h3>

          <motion.div className="z-10 flex w-full flex-col items-start gap-4 lg:w-3/4">
            <Input
              placeholder={`${env.NEXT_PUBLIC_APP_URL}/your_name`}
              className="h-12 w-full border-primary text-lg"
            />
            <ShimmerButton
              // href="/dashboard/settings"
              shimmerColor="yellow"
              className={cn(buttonVariants({ size: "lg" }), "w-full lg:w-auto")}
            >
              <span className="dark:from-white dark:to-slate-900/10 whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
                Claim your CallMyAI
              </span>
            </ShimmerButton>
          </motion.div>
        </motion.div>

        <div className="mt-8 w-full lg:mt-0 lg:w-1/2">
          <div className="flex flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
            <HeroVideoDialog
              className="w-full"
              animationStyle="from-center"
              videoSrc={demos[0]?.videoUrl ?? ""}
              thumbnailSrc={demos[0]?.thumbnailSrc ?? ""}
              thumbnailAlt={`Demo video ${1}`}
            />
            {/* <Carousel className="w-full">
              <CarouselContent>
                {demos.map((demo, index) => (
                  <CarouselItem className="relative" key={index}>
                    <HeroVideoDialog
                      animationStyle="from-center"
                      videoSrc={demo.videoUrl}
                      thumbnailSrc={demo.thumbnailSrc}
                      thumbnailAlt={`Demo video ${index + 1}`}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious
                variant="default"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-foreground/80 hover:bg-foreground"
              />
              <CarouselNext
                variant="default"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-foreground/80 hover:bg-foreground"
              />
            </Carousel> */}
          </div>
        </div>
      </div>
    </div>
  )
}
