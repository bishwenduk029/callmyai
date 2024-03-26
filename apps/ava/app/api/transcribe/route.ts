import OpenAI from 'openai'

const speechBackend = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request, res: Response) {
  const formData = await req.formData()

  try {
    // Create transcription from a video file
    const transcriptionResponse =
      await speechBackend.audio.transcriptions.create({
        // @ts-ignore
        file: formData.get('audio'),
        model: 'whisper-1',
        language: 'en'
      })

    const transcript = transcriptionResponse?.text

    // Return the transcript if no inappropriate content is detected
    return new Response(JSON.stringify({ transcript }), {
      status: 200
    })
  } catch (error) {
    console.error('server error', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500
    })
  }
}
