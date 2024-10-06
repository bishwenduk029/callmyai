import { type FrequentlyAskedQuestion } from "@/types"

import { siteConfig } from "@/config/site"

export const frequentlyAskedQuestions: FrequentlyAskedQuestion[] = [
  {
    question: `What is ${siteConfig.name}?`,
    answer: `${siteConfig.name} CallMyAI.app is a platform that allows users and businesses to create AI-powered call assistants from simple prompts on the web. It is not integrated with telephony. The app uses generative AI technology to handle phone calls on behalf of users, potentially for tasks like scheduling, customer service, or information gathering.`,
  },
  {
    question: `Why would I want to use ${siteConfig.name}?`,
    answer: `Since everything is professionally pre-configured and up to the latest standards, 
              you save a tremendous amount of time and effort, which you can now spend focusing 
              on what really matters.`,
  },
  {
    question: `Is is easy to use? How do I get started?`,
    answer: `${siteConfig.name} is extremely easy to use. You can get started by signing up. Get a user handle for yourself which is unique for you and share the same with everyone and anyone interested in calling you.`,
  },
  {
    question: `Can I get help and support?`,
    answer: `Feel free to email us with any questions.`,
  },
]
