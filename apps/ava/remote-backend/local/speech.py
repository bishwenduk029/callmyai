from melo.api import TTS
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
from faster_whisper import WhisperModel
from typing import Optional
from pydantic import BaseModel
import io

import logging

logging.basicConfig()
logging.getLogger("faster_whisper").setLevel(logging.DEBUG)

device = "auto"
tts = TTS(language='EN', device=device)


class SpeechRequest(BaseModel):
    input: str
    model: Optional[str] = None
    voice: Optional[str] = None
    response_format: Optional[str] = None
    speed: Optional[int] = None


whisper_model = "small.en"
whisper = WhisperModel(whisper_model, device=device, compute_type="int8")


app = FastAPI()


@app.post('/v1/audio/speech', response_class=StreamingResponse)
def speech(request_data: SpeechRequest):
    input = request_data.input
    speaker_ids = tts.hps.data.spk2id

    def audio_stream():
        bio = io.BytesIO()
        tts.tts_to_file(
            input, speaker_ids[request_data.voice], bio, speed=1, format='mp3')
        audio_data = bio.getvalue()
        yield audio_data

    return StreamingResponse(audio_stream(), media_type="audio/mpeg")


@app.post('/v1/audio/transcriptions')
async def transcribe_audio(file: UploadFile = File(...)):
    # Instead of saving the file to disk, use the file directly in memory
    audio_data = await file.read()
    # Convert the bytes-like object to a BytesIO object
    audio_stream = io.BytesIO(audio_data)
    # After saving, you can proceed with your transcription logic
    segments, info = whisper.transcribe(
        audio_stream, beam_size=5, language="en")
    text = ""
    for segment in segments:
        text += segment.text
    return {"text": text}


def main():
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
