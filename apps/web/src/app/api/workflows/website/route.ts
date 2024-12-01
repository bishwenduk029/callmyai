// @ts-nocheck
import { google } from "@ai-sdk/google"
import { streamText } from "ai"
import axios from "axios"

const CRAWLER_BASE_URL =
  process.env.CRAWLER_BASE_URL || "http://127.0.0.1:11235"
const CRAWLER_API_TOKEN = process.env.CRAWLER_API_TOKEN

async function crawlWebsite(url: string): Promise<string> {
  try {
    const response = await axios.post(
      `${CRAWLER_BASE_URL}/crawl`,
      {
        urls: [url],
        priority: 10,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CRAWLER_API_TOKEN}`,
        },
      }
    )

    const taskId = response.data.task_id
    let markdown = ""

    // Poll for results
    while (true) {
      const resultResponse = await axios.get(
        `${CRAWLER_BASE_URL}/task/${taskId}`,
        {
          headers: { Authorization: `Bearer ${CRAWLER_API_TOKEN}` },
        }
      )

      if (resultResponse.data.status === "completed") {
        markdown = resultResponse.data.results[0].markdown
        break
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    return markdown
  } catch (error) {
    console.error("Crawling error:", error)
    throw new Error("Failed to crawl website")
  }
}

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json()

  const markdown = await crawlWebsite(prompt)

  const result = streamText({
    // @ts-ignore
    model: google("gemini-1.5-flash-latest"),
    system: "You are a helpful assistant.",
    prompt: `Given the following markdown content from a website, generate a concise and professional business description in plain text. Focus on the key aspects of what the business does, their value proposition, and any unique selling points:
  
        ${markdown}
        
        Format the description in 2-3 paragraphs, keeping it under 300 words.`,
  })

  return result.toDataStreamResponse()
}
