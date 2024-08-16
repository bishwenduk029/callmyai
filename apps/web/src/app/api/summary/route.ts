import { CoreMessage } from "ai";
import { summarizeCall } from '@/actions/user';
import crypto from "crypto";
import { env } from "@/env.mjs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("X-Signature");

    if (!signature || !env.API_SECRET_KEY) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hmac = crypto.createHmac("sha256", env.API_SECRET_KEY);
    const computedSignature = hmac.update(rawBody).digest("hex");

    if (signature !== computedSignature) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { chatId, chatTranscripts } = body;

    if (!chatId || !Array.isArray(chatTranscripts)) {
      return Response.json({ error: "Invalid input: chatId and chatTranscripts array are required" }, { status: 400 });
    }

    const result = await summarizeCall(chatId, chatTranscripts as CoreMessage[]);

    if (result.success) {
      return Response.json({
        success: true,
        chatId: result.chatId,
        title: result.title,
        summary: result.summary,
      });
    } else {
      return Response.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("Failed to summarize chat:", error);
    return Response.json({ success: false, error: "Failed to summarize chat" }, { status: 500 });
  }
}