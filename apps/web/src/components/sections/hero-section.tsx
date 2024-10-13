"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import Balancer from "react-wrap-balancer"

import { env } from "@/env.mjs"

import { useMediaQuery } from "@/hooks/use-media"
import { cn } from "@/lib/utils"

import { buttonVariants } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { CallMyAiMobilePreview } from "../assistant/callmyai-mobile-preview"
import { FlipWords } from "../ui/flip-words"
import { Input } from "../ui/input"

const salesAgentId = env.NEXT_PUBLIC_CALLMYAI_SALES_AGENT_ID

export function HeroSection() {
  const isDesktop = useMediaQuery("(min-width: 1280px)")
  return (
    <div
      id="hero-section"
      aria-label="hero section"
      className="md:mt-38 mt-16 w-full"
    >
      <div className="container flex w-full flex-col items-start gap-6 lg:flex-row">
        <motion.div
          className="my-auto w-full text-left lg:w-1/2"
          initial={{ opacity: 0.5, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h1 className="mb-4 font-heading text-3xl font-bold sm:text-6xl">
            AI Powered Voice Assistant{" "}
            <span className="bg-clip-text underline">in seconds</span>
          </h1>

          <motion.h3 className="mb-6 max-w-2xl font-urbanist text-2xl text-foreground sm:text-4xl">
            <Balancer>
              Create AI-Powered voice assistants for multiple roles: <br />
              <span className="flex flex-row">
                <span>AI&nbsp;</span>
                <FlipWords
                  words={[
                    "Receptionists",
                    "Customer Support Rep",
                    "Personal Assistant",
                    "Knowledge Bot",
                    "Call Center Rep",
                    "Sales Rep",
                    "Call Assistant",
                  ]}
                />{" "}
              </span>
            </Balancer>
          </motion.h3>

          <motion.div className="z-10 flex w-full flex-col items-start gap-4 lg:w-3/4">
            <Input
              placeholder={`${env.NEXT_PUBLIC_APP_URL}/your_name`}
              className="h-12 w-full border-primary text-lg"
            />
            <Link
              href="/dashboard/settings"
              className={cn(buttonVariants({ size: "lg" }), "w-full lg:w-auto")}
            >
              <span className="dark:from-white dark:to-slate-900/10 whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-background lg:text-lg">
                Claim your CallMyAI
              </span>
            </Link>
          </motion.div>
        </motion.div>

        <div className="mt-8 w-full lg:mt-0 lg:w-1/2">
          {isDesktop ? (
            <Tabs defaultValue="aisha" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="aisha">AI Sales Agent</TabsTrigger>
                <TabsTrigger value="receptionist">
                  AI Receptionist (NOVA)
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
          ) : (
            <CallMyAiMobilePreview
              assistantId={salesAgentId}
              title="Try our AI Sales Agent"
            />
          )}
        </div>
      </div>
    </div>
  )
}
