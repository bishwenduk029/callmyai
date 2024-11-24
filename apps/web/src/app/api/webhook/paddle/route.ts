import { getPaddleInstance, ProcessWebhook } from "@/lib/paddle"

const webhookProcessor = new ProcessWebhook()

const allowedIPs = [
  "34.232.58.13",
  "34.195.105.136",
  "34.237.3.244",
  "35.155.119.135",
  "52.11.166.252",
  "34.212.5.7"
];

export async function POST(request: Request) {
  const clientIP = request.headers.get("x-forwarded-for");
  if (!clientIP || !allowedIPs.includes(clientIP)) {
    return new Response("Forbidden", { status: 403 });
  }

  const signature = request.headers.get("paddle-signature") || ""
  const rawRequestBody = await request.text()
  const privateKey = process.env["PADDLE_NOTIFICATION_WEBHOOK_SECRET"] || ""

  let status, eventName
  try {
    if (signature && rawRequestBody) {
      const paddle = getPaddleInstance()
      const eventData = paddle.webhooks.unmarshal(
        rawRequestBody,
        privateKey,
        signature
      )
      status = 200
      eventName = eventData?.eventType ?? "Unknown event"
      if (eventData) {
        await webhookProcessor.processEvent(eventData)
      }
    } else {
      status = 400
      console.log("Missing signature from header")
    }
  } catch (e) {
    // Handle error
    status = 500
    console.log(e)
  }
  return Response.json({ status, eventName })
}
