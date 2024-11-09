"use client"

import Link from "next/link"
import { Check } from "@phosphor-icons/react/dist/ssr"
import { motion } from "framer-motion"

import { env } from "@/env.mjs"

import { useMediaQuery } from "@/hooks/use-media"
import { cn } from "@/lib/utils"

import { buttonVariants } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { CallMyAiMobilePreview } from "../assistant/callmyai-mobile-preview"
import { FlipWords } from "../ui/flip-words"
import { Input } from "../ui/input"

const salesAgentId = env.NEXT_PUBLIC_CALLMYAI_SALES_AGENT_ID

const FEATURE_POINTS = [
  {
    title: "Natural conversations with AI voice",
    description: "Engage customers with human-like voice interactions",
  },
  {
    title: "Customize your AI voice agent",
    description:
      "With simple instructions, you can customize your AI voice agent to fit your needs",
  },
  {
    title: "Seamless data integration",
    description:
      "Power your AI voice agents with your business data from Intercom, Hubspot and other tools you already use",
  },
  {
    title: "Connect with your existing tools/apps",
    description:
      "Seamlessly integrate with Slack, CRMs, and your favorite business tools for automated updates and insights",
  },
  {
    title: "24/7 Customer engagement",
    description:
      "Reduce operational costs with always-available AI voice agents",
  },
]

export function HeroSection() {
  const isDesktop = useMediaQuery("(min-width: 1280px)")
  return (
    <div
      id="hero-section"
      aria-label="hero section"
      className="md:mt-38 container mt-16 w-full"
    >
      <div className="container flex w-full flex-col items-center gap-6">
        <motion.div
          className="my-auto w-full text-center sm:w-[80%]"
          initial={{ opacity: 0.5, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h1 className="mb-4 mt-20 font-heading text-3xl font-bold sm:text-7xl">
            <span className="">
              AI Voice Experiences{" "}
              <span className="underline decoration-primary">in minutes</span>
            </span>
          </h1>

          <motion.h3 className="mb-6 w-full text-nowrap font-urbanist text-xl text-muted-foreground sm:text-4xl">
            <span>
              Create AI-Powered voice assistants for multiple roles: <br />
              <span className="flex flex-row justify-center">
                <span>AI</span>
                <FlipWords
                  className="text-primary"
                  words={[
                    "Receptionists",
                    "Customer Support",
                    "Personal Assistant",
                    "Knowledge Bot",
                    "Call Center Rep",
                    "Sales Rep",
                    "Call Assistant",
                  ]}
                />{" "}
              </span>
            </span>
          </motion.h3>

          <motion.div className="z-10 mx-auto flex w-full max-w-md flex-col items-center gap-4">
            <Input
              placeholder={`${env.NEXT_PUBLIC_APP_URL}/your_name`}
              className="h-12 w-full border-primary text-lg"
            />
            <Link
              href="/dashboard/settings"
              className={cn(buttonVariants({ size: "lg" }), "w-full")}
            >
              <span className="dark:from-white dark:to-slate-900/10 whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight lg:text-lg">
                Claim your Free Personal CallMyAI
              </span>
            </Link>
            <span className="text-center text-sm text-muted-foreground">
              No credit card required. Free AI Call Screener on SignUp.
            </span>
          </motion.div>
        </motion.div>

        <div className="relative z-10 mt-14 grid w-full grid-cols-1 gap-8 border-t-primary bg-background p-2 lg:grid-cols-2">
          <div className="absolute bottom-0 left-0 h-20 w-full rounded-lg bg-gradient-to-b from-background/0 via-background/50 to-background md:h-28"></div>
          <div className="absolute left-1/2 top-2 mx-auto h-5 w-[90%] -translate-x-1/2 transform rounded-full bg-primary/50 blur-3xl lg:-top-8 lg:h-20"></div>
          {/* Left column - Demo */}
          <div className="relative order-2 lg:order-1">
            {isDesktop ? (
              <div className="relative">
                <div className="absolute -top-10 left-0 h-32 w-full rounded-lg bg-gradient-to-b from-background/0 via-background/50 to-background"></div>
                <Tabs defaultValue="aisha" className="relative w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="aisha">For Businesses</TabsTrigger>
                    <TabsTrigger value="receptionist">
                      For Individuals
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="aisha">
                    <div className="flex flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
                      <div className="relative h-[650px] w-full rounded-2xl border-transparent p-[5px] shadow-xl">
                        <iframe
                          src={`${env.NEXT_PUBLIC_APP_URL}/assistants/${salesAgentId}`}
                          className="absolute left-0 top-0 h-full w-full rounded-2xl border-2 border-black"
                          style={{
                            boxShadow: "0 0 15px 2px rgba(0, 0, 0, 0.5)",
                            overflow: "hidden",
                          }}
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                          scrolling="no"
                        ></iframe>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="receptionist">
                    <div className="flex flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
                      <div className="relative h-[650px] w-full rounded-2xl border-transparent p-[5px] shadow-xl">
                        <iframe
                          src={`${env.NEXT_PUBLIC_APP_URL}/sayanti`}
                          className="absolute left-0 top-0 h-full w-full rounded-2xl border-2 border-black"
                          style={{
                            boxShadow: "0 0 15px 2px rgba(0, 0, 0, 0.5)",
                            overflow: "hidden",
                          }}
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                          scrolling="no"
                        ></iframe>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <CallMyAiMobilePreview
                  assistantId={salesAgentId}
                  title="Try our AI Sales Agent Free"
                />
              </div>
            )}
          </div>

          {/* Right column - Feature points */}
          <div className="order-1 flex flex-col justify-center gap-6 rounded-md bg-primary/95 text-xl text-primary-foreground lg:order-2">
            <div className="rounded-xl border border-primary/20 p-6">
              <div className="grid gap-6">
                {FEATURE_POINTS.map((point, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10">
                      <Check className="h-4 w-4 text-white" weight="bold" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold leading-none text-primary-foreground">
                        {point.title}
                      </h3>
                      <p className="text-lg text-primary-foreground/80">
                        {point.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
