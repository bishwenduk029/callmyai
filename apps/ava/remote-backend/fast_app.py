from modal import Image, Stub, asgi_app
from fastapi import Request, FastAPI

MODEL_DIR = "/model"

web_app = FastAPI()


def download_model():
    from faster_whisper import WhisperModel
    from melo.api import TTS

    whisper_model = "distil-medium.en"
    device = "auto"

    whisper = WhisperModel(
        whisper_model,
        device="cuda",
        compute_type="float16"
    )

    tts = TTS(language='EN', device=device)


image = (
    Image.from_registry(
        "nvidia/cuda:12.1.0-cudnn8-devel-ubuntu22.04", add_python="3.11")
    .apt_install("git", "ffmpeg", "curl", "mecab", "mecab-ipadic-utf8", "libmecab-dev", "swig")
    .run_commands(
        ["git clone https://github.com/myshell-ai/MeloTTS.git",
         ]).workdir("./MeloTTS").run_commands([
             "ls",
             "sed -i 's/torch<2.0/torch/' requirements.txt",
             "sed -i '/mecab-python3==1.0.5/d' requirements.txt",
             "pip install mecab-python3",
             "pip install -e .",
             "python -m unidic download",]).run_commands(["python -m pip install wheel", "python -m pip install ninja", "python -m pip install flash-attn --no-build-isolation", "pip install faster_whisper"], gpu="A10G").env({"HF_HUB_ENABLE_HF_TRANSFER": "1"}).run_commands(["pip install hf_transfer"]).run_function(
        download_model, gpu="A10G"
    ))

stub = Stub("ava_asr", image=image)


@stub.function(gpu="A10G", keep_warm=1)
@asgi_app()
def entrypoint():
    import torch
    from faster_whisper import WhisperModel
    from melo.api import TTS
    from fastapi import File, UploadFile, HTTPException
    from fastapi.responses import Response
    import tempfile
    from typing import Optional
    from pathlib import Path
    import shutil
    from dataclasses import dataclass
    from pydantic import BaseModel
    import os
    import io

    whisper_model = "distil-medium.en"

    device = "auto"

    whisper = WhisperModel(
        whisper_model,
        device="cuda",
        compute_type="float16"
    )

    tts = TTS(language='EN', device=device)

    @dataclass(frozen=True)
    class TTSRequest:
        text: str

    class SpeechRequest(BaseModel):
        input: str
        model: Optional[str]
        voice: Optional[str]
        response_format: Optional[str]
        speed: Optional[int]

    @web_app.post('/v1/audio/speech', response_class=Response)
    def speech(request_data: SpeechRequest):
        payload = None
        wav_out_path = None
        input = request_data.input
        speaker_ids = tts.hps.data.spk2id

        try:
            tts_req = TTSRequest(text=input)
            # Create a temporary file
            wav_out_path = tempfile.mktemp(suffix=".wav")
            tts.tts_to_file(
                tts_req.text, speaker_ids[request_data.voice], wav_out_path, speed=1)
            with open(wav_out_path, "rb") as f:
                return Response(content=f.read(), media_type="audio/wav")
        except Exception as e:
            # traceback_str = "".join(traceback.format_tb(e.__traceback__))
            print(e)
            print(f"Error processing request {input}")
            return Response(
                content="Something went wrong. Please try again in a few mins or contact us on Discord",
                status_code=500,
            )
        finally:
            # Remove the temporary file if it was created
            if wav_out_path is not None and os.path.exists(wav_out_path):
                os.remove(wav_out_path)

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
