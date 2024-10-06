import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string(),
    AUTH_SECRET: z.string(),
    GOOGLE_ID: z.string(),
    GOOGLE_SECRET: z.string(),
    GITHUB_ID: z.string().optional(),
    GITHUB_SECRET: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    RESEND_EMAIL_FROM: z.string().email(),
    RESEND_EMAIL_TO: z.string().email(),
    RESEND_HOST: z.string(),
    RESEND_USERNAME: z.string(),
    RESEND_PORT: z.string(),
    OPENAI_MODEL: z.string(),
    DEEPGRAM_API_KEY: z.string().optional(),
    SYSTEM_PROMPT: z.string(),
    LEMONSQUEEZY_WEBHOOK_SECRET: z.string(),
    LEMONSQUEEZY_API_KEY: z.string(),
    LEMONSQUEEZY_STORE_ID: z.string(),
    LEMONSQUEEZY_VARIANT_ID: z.string(),
    API_SECRET_KEY: z.string(),
    VOICE_BACKEND_URL: z.string(),
    CALLMYAI_AGENT_CALL_DURATION: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_VOICE_BACKEND_URL: z.string().url().optional(),
    NEXT_PUBLIC_CALLMYAI_SALES_AGENT_ID: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_VOICE_BACKEND_URL: process.env.NEXT_PUBLIC_VOICE_BACKEND_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    GOOGLE_ID: process.env.GOOGLE_ID,
    GOOGLE_SECRET: process.env.GOOGLE_SECRET,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_EMAIL_FROM: process.env.RESEND_EMAIL_FROM,
    RESEND_EMAIL_TO: process.env.RESEND_EMAIL_TO,
    RESEND_HOST: process.env.RESEND_HOST,
    RESEND_USERNAME: process.env.RESEND_USERNAME,
    RESEND_PORT: process.env.RESEND_PORT,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY,
    SYSTEM_PROMPT: process.env.SYSTEM_PROMPT,
    LEMONSQUEEZY_WEBHOOK_SECRET: process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
    LEMONSQUEEZY_API_KEY: process.env.LEMONSQUEEZY_API_KEY,
    LEMONSQUEEZY_STORE_ID: process.env.LEMONSQUEEZY_STORE_ID,
    LEMONSQUEEZY_VARIANT_ID: process.env.LEMONSQUEEZY_VARIANT_ID,
    API_SECRET_KEY: process.env.API_SECRET_KEY,
    VOICE_BACKEND_URL: process.env.VOICE_BACKEND_URL,
    NEXT_PUBLIC_CALLMYAI_SALES_AGENT_ID: process.env.NEXT_PUBLIC_CALLMYAI_SALES_AGENT_ID,
    CALLMYAI_AGENT_CALL_DURATION: process.env.CALLMYAI_AGENT_CALL_DURATION,
  },
})
