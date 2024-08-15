import { CoreMessage } from "ai";
import { summarizeCall } from '@/actions/user';

export async function POST(request: Request) {
  try {
    const body = await request.json();
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