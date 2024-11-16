import { type FrequentlyAskedQuestion } from "@/types"

import { siteConfig } from "@/config/site"

export const frequentlyAskedQuestions: FrequentlyAskedQuestion[] = [
  {
    question: `What is ${siteConfig.name}?`,
    answer: `${siteConfig.name} CallMyAI.app is a platform that allows users and businesses to create AI-powered call assistants from simple instructions. The app uses generative AI technology to handle phone calls on behalf of users, potentially for tasks like scheduling, customer service, or information gathering.`,
  },
  {
    question: `What is Personal AI Call Screening?`,
    answer: `Personal AI Call Screening is a ready to go AI voice asssistant available for free on SignUp. It is mainly for personal use, you can share the web url for your AI Call Screener with anyone and they can call you from web.`,
  },
  {
    question: `Can I create custom AI Voice Assistants?`,
    answer: `${siteConfig.name} is extremely easy to use. You can get started by signing up. Paid plans allow you to create multiple AI Voice Assistants. You can purchase AI phone numbers which can be assigned to AI voice assistants to handle inbound calls.`,
  },
  {
    question: "Can I use CallMyAI for AI Phone Reception?",
    answer: "Yes, CallMyAI works great as an AI receptionist. Simply create an AI Voice Assistant customized with your desired reception workflow, assign it your Twilio phone number, and share that number with your customers to start handling incoming calls automatically.",
  },
  {
    question: `Does it support outbound calls?`,
    answer: `No. As of today it only supports Inbound calls`,
  },
  {
    question: `Can I connect Twilio phone number to CallMyAI voice agents?`,
    answer: `Yes, you can connect your Twilio phone number to CallMyAI voice agents. Bring your Twilio phone number and assign it to your AI Voice Assistant to handle inbound calls.`,
  },
  {
    question: "How do I customize the behavior of AI Voice Assistants?",
    answer: "You can customize the behavior of AI Voice Assistants by providing instructions or a call script in natural language for it to follow.",
  },
  {
    question: `Can I get help and support?`,
    answer: `Feel free to email us with any questions at sayanti.nath@callmyai.app.`,
  },
]
