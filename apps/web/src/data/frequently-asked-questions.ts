import { type FrequentlyAskedQuestion } from "@/types"

import { siteConfig } from "@/config/site"

export const frequentlyAskedQuestions: FrequentlyAskedQuestion[] = [
  {
    question: `What is ${siteConfig.name}?`,
    answer: `${siteConfig.name} is a platform for creating AI-powered call assistants using generative AI technology.`,
  },
  {
    question: `What is Personal AI Call Screening?`,
    answer: `A free AI voice assistant for personal use, accessible via a shared web URL.`,
  },
  {
    question: `Can I create custom AI Voice Assistants?`,
    answer: `Yes, sign up to create multiple AI Voice Assistants with paid plans.`,
  },
  {
    question: "Can I use CallMyAI for AI Phone Reception?",
    answer: "Yes, create a customized AI Voice Assistant and assign it a Twilio phone number.",
  },
  {
    question: "Does it support outbound calls?",
    answer: "No, only inbound calls are supported.",
  },
  {
    question: "Can I connect CallMyAI voice agents with Twilio phone numbers?",
    answer: "Yes, connect your Twilio phone number to handle inbound calls.",
  },
  {
    question: "How do I customize the behavior of AI Voice Assistants?",
    answer: "Provide instructions or a call script in natural language.",
  },
  {
    question: `Can I get help and support?`,
    answer: `Email us at sayanti.nath@callmyai.app.`,
  },
]
