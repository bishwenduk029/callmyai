from modal import Image, Stub, asgi_app
from fastapi import FastAPI

MODEL_DIR = "/model"

web_app = FastAPI()


def download_model():
    from faster_whisper import WhisperModel

    whisper_model = "distil-large-v2"

    whisper = WhisperModel(
        whisper_model,
        device="cuda",
        compute_type="float16"
    )


image = (
    Image.from_registry(
        "nvidia/cuda:12.1.0-cudnn8-devel-ubuntu22.04", add_python="3.11")
    .apt_install("git", "ffmpeg").run_commands(["python -m pip install packaging", "python -m pip install wheel", "python -m pip install torch", "python -m pip install ninja", "python -m pip install flash-attn --no-build-isolation", "pip install faster_whisper"], gpu="A10G").env({"HF_HUB_ENABLE_HF_TRANSFER": "1"}).run_commands(["pip install hf_transfer"]).run_function(
        download_model, gpu="A10G"
    ))

stub = Stub("ava_asr", image=image)


@stub.function(gpu="A10G", keep_warm=1)
@asgi_app()
def entrypoint():
    from faster_whisper import WhisperModel
    from fastapi import File, UploadFile
    from typing import Optional
    from pydantic import BaseModel
    import io

    whisper_model = "distil-large-v2"

    whisper = WhisperModel(
        whisper_model,
        device="cuda",
        compute_type="float16"
    )

    class SpeechRequest(BaseModel):
        input: str
        model: Optional[str]
        voice: Optional[str]
        response_format: Optional[str]
        speed: Optional[int]

    @web_app.post('/v1/audio/transcriptions')
    async def transcribe_audio(file: UploadFile = File(...)):

        # Instead of saving the file to disk, use the file directly in memory
        audio_data = file.file.read()

        # Convert the bytes-like object to a BytesIO object
        audio_stream = io.BytesIO(audio_data)

        # After saving, you can proceed with your transcription logic
        segments, info = whisper.transcribe(
            audio_stream, beam_size=5, language="en")

        text = ""
        for segment in segments:
            text += segment.text
        return {"text": text}

    return web_app
