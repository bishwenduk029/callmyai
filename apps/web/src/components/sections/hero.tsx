"use client"

import { Check } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import Balancer from "react-wrap-balancer"

import { env } from "@/env.mjs"

import { useMediaQuery } from "@/hooks/use-media"
import { cn } from "@/lib/utils"

import { buttonVariants } from "@/components/ui/button"
import Glow from "@/components/ui/glow"
import { Mockup, MockupFrame } from "@/components/ui/mockup"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { CallMyAiMobilePreview } from "../assistant/callmyai-mobile-preview"
import { FlipWords } from "../ui/flip-words"
import { Input } from "../ui/input"
import { Section } from "../ui/section"

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

export default function Hero() {
  const isDesktop = useMediaQuery("(min-width: 1280px)")

  return (
    <Section className="font-inter overflow-hidden pb-0 sm:pb-0 md:pb-0">
      <div className="max-w-container mx-auto flex flex-col gap-12 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {/* <Badge variant="outline" className="animate-appear">
            <span className="text-muted-foreground">
              New version of Jupiter is out!
            </span>
            <a href={siteConfig.url} className="flex items-center gap-1">
              Read more
              <ArrowRight className="h-3 w-3" />
            </a>
          </Badge> */}
          <h1 className="animate-appear inline-block bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-4xl font-heading font-semibold leading-tight text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight md:text-8xl md:leading-tight">
            <span className="font-heading">
              Craft AI Voice Experiences{" "}
              {/* <span className="underline decoration-primary">in minutes</span> */}
            </span>
          </h1>
          <p className="text-lg animate-appear font-urbanist font-medium text-muted-foreground opacity-0 delay-100 sm:text-3xl">
            <Balancer>
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
            </Balancer>
          </p>
          <div className="animate-appear relative z-10 flex justify-center gap-4 opacity-0 delay-300">
            <div className="z-10 mx-auto flex w-full max-w-md flex-col items-center gap-4">
              <Input
                placeholder={`${env.NEXT_PUBLIC_APP_URL}/your_name`}
                className="h-12 w-full border-primary text-lg"
              />
              <Link
                href="/dashboard/settings"
                className={cn(buttonVariants({ size: "lg" }), "w-full")}
              >
                <span className="dark:from-white dark:to-slate-900/10 whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-background dark:text-foreground lg:text-lg">
                  Get Free CallMyAI Phone Screener
                </span>
              </Link>
              <span className="text-center text-sm text-muted-foreground">
                No credit card required. Free AI Call Screener on SignUp.
              </span>
            </div>
          </div>
          <div className="relative">
            <MockupFrame
              className="animate-appear opacity-100 delay-700"
              size="large"
            >
              <Mockup type="responsive" className="bg-background">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                  {/* Left column - Demo */}
                  <div className="lg:col-span-1 w-full min-w-0">
                    {isDesktop ? (
                      <div className="relative">
                        <Tabs defaultValue="aisha" className="relative w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="aisha">
                              For Businesses
                            </TabsTrigger>
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
                                    boxShadow:
                                      "0 0 15px 2px rgba(0, 0, 0, 0.5)",
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
                                    boxShadow:
                                      "0 0 15px 2px rgba(0, 0, 0, 0.5)",
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
                      <div className="flex flex-col">
                        <CallMyAiMobilePreview
                          assistantId={salesAgentId}
                          title="Try our AI Sales Agent Free"
                        />
                      </div>
                    )}
                  </div>

                  {/* Right column - Feature points */}
                  <div className="lg:col-span-1 flex flex-col justify-center gap-6 rounded-md bg-primary/95 text-xl text-background dark:text-foreground">
                    <div className="rounded-xl border border-primary/20 p-6">
                      <div className="grid gap-6">
                        {FEATURE_POINTS.map((point, index) => (
                          <div key={index} className="flex items-start gap-4 text-left">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white">
                              <Check
                                className="h-4 w-4 text-primary"
                                weight="bold"
                                size={"2xl"}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <h3 className="font-extrabold leading-none">
                                {point.title}
                              </h3>
                              <p className="text-lg">{point.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Mockup>
            </MockupFrame>
            <Glow
              variant="top"
              className="animate-appear-zoom opacity-0 delay-1000"
            />
          </div>
        </div>
      </div>
    </Section>
  )
}
