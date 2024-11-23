"use client"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

import { AnimatedBeamActions } from "../fancy/animated-beams-actions"
import { AnimatedBeamMultipleDataSources } from "../fancy/animated-beams-data"
import { Section } from "../ui/section"

export function FeaturesSection() {
  const features = [
    {
      title: "Inbound Calls",
      description:
        "Our advanced AI voice bot takes calls on your behalf, saving you time and reducing interruptions.",
    },
    {
      title: "Call Summarization",
      description:
        "Receive concise, tweet-like summaries of all your calls, making it easy to review and prioritize follow-ups.",
    },
    {
      title: "Web Links",
      description:
        "No phone integration required. Callers simply use a unique web link to reach your AI assistant.",
    },
    {
      title: "AI Call Screening",
      description:
        "Customize screening criteria and let AI intelligently filter calls, ensuring you only receive relevant communications.",
    },
    {
      title: "Enterprise-Ready",
      description:
        "Connect external apps for business workflows to reach multiple users efficiently, with scalable access options.",
    },
    {
      title: "Privacy-First Approach",
      description:
        "Your data security is our priority. All conversations are handled with strict privacy measures.",
    },
    {
      title: "Simple Pricing",
      description:
        "Choose from our range of plans, from individual users to large enterprises, with no hidden fees.",
    },
    {
      title: "24/7 Availability",
      description:
        "Your AI call assistant is always on duty, ensuring you never miss an important call, day or night.",
    },
  ]
  return (
    <Section className="font-urbanist overflow-hidden mx-auto">
      <div className="mb-16 text-center">
        <h2 className="font-heading inline-block animate-appear bg-foreground bg-clip-text text-4xl font-semibold leading-tight text-transparent drop-shadow-2xl sm:text-5xl sm:leading-tight">
          Revolutionize Your Communication
        </h2>
        <p className="mx-auto max-w-2xl text-xl text-gray-600">
          Discover how our AI-powered features can transform your business
          communication and efficiency.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="group relative mx-auto w-full max-w-[400px] overflow-hidden rounded-3xl border p-2 sm:max-w-none sm:p-6 sm:shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.1),_0_8px_10px_-6px_rgb(0_0_0_/_0.1)] dark:sm:shadow-[0_20px_25px_-5px_rgb(255_255_255_/_0.05),_0_8px_10px_-6px_rgb(255_255_255_/_0.05)]"
        >
          <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b p-4">
            <h4 className="font-semibold text-primary">
              External Data Sources
            </h4>
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
              Connected
            </span>
          </div>
          <div className="flex max-w-sm flex-col gap-6 pt-16 sm:max-w-lg">
            <AnimatedBeamMultipleDataSources className="w-full" />
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground">
                CallMyAI agents can learn from your data
              </h3>
              <ul className="text-md list-disc space-y-2 text-muted-foreground sm:pl-4 sm:text-lg">
                <li>
                  Seamlessly integrate with{" "}
                  <span className="text-primary">Google Drive</span>,{" "}
                  <span className="text-primary">Notion</span>,{" "}
                  <span className="text-primary">Intercom</span> and more
                </li>
                <li>
                  AI Voice assistant learns from your documents and websites
                </li>
                <li>Context-aware responses based on your connected data</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="group relative mx-auto w-full max-w-[400px] overflow-hidden rounded-3xl border p-2 sm:max-w-none sm:p-6 sm:shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.1),_0_8px_10px_-6px_rgb(0_0_0_/_0.1)] dark:sm:shadow-[0_20px_25px_-5px_rgb(255_255_255_/_0.05),_0_8px_10px_-6px_rgb(255_255_255_/_0.05)]"
        >
          <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b p-4">
            <h4 className="font-semibold text-primary">Workflow Automation</h4>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
              Active
            </span>
          </div>
          <div className="flex max-w-sm flex-col gap-6 pt-16 sm:max-w-lg">
            <AnimatedBeamActions className="w-full" />
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground">
                CallMyAI agents can act on your apps
              </h3>
              <ul className="my-4 list-disc space-y-2 pl-4 text-lg text-muted-foreground">
                <li>Execute actions across your connected apps</li>
                <li>Natural language commands for task automation</li>
                <li>Intelligent workflow orchestration</li>
                <li>Real-time action tracking and notifications</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-y-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-y-0">
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </Section>
  )
}

const Feature = ({
  title,
  description,
  index,
}: {
  title: string
  description: string
  index: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "group/feature font-urbanist relative z-0 flex flex-col py-10 text-center dark:border-neutral-800 sm:text-left lg:border-r",
        (index === 0 || index === 4) && "dark:border-neutral-800 lg:border-l",
        index < 4 && "dark:border-neutral-800 lg:border-b"
      )}
    >
      {index < 4 && (
        <div className="dark:from-primary-800 from-primary-100 pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-t to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100" />
      )}
      {index >= 4 && (
        <div className="dark:from-primary-800 from-primary-100 pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-b to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100" />
      )}
      <div className="relative z-10 mb-2 px-4 text-xl font-bold sm:px-10">
        <div className="absolute inset-y-0 left-0 hidden h-6 w-1 origin-center rounded-br-full rounded-tr-full bg-neutral-300 transition-all duration-200 group-hover/feature:h-8 group-hover/feature:bg-green-500 dark:bg-neutral-700 sm:block" />
        <span className="inline-block text-foreground text-xl transition duration-200 group-hover/feature:translate-x-2 dark:text-foreground">
          {title}
        </span>
      </div>
      <p className="relative z-10 mx-auto max-w-xs px-4 text-lg text-muted-foreground sm:mx-0 sm:px-10">
        {description}
      </p>
    </motion.div>
  )
}
