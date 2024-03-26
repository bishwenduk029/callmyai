from modal import Image, Stub, asgi_app
from fastapi import FastAPI

MODEL_DIR = "/model"

web_app = FastAPI()


def download_model():
    from melo.api import TTS
    device = "auto"

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
             "python -m unidic download",]).env({"HF_HUB_ENABLE_HF_TRANSFER": "1"}).run_commands(["pip install hf_transfer"]).run_function(
        download_model, gpu="A10G"
    ))

stub = Stub("ava_speech", image=image)


@stub.function(gpu="A10G", keep_warm=1)
@asgi_app()
def entrypoint():
    import torch
    from melo.api import TTS
    from fastapi import File, UploadFile, HTTPException
    from fastapi.responses import Response, StreamingResponse
    import tempfile
    from typing import Optional
    from pathlib import Path
    import shutil
    from dataclasses import dataclass
    from pydantic import BaseModel
    import os
    import io

    device = "auto"

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

    @web_app.post('/v1/audio/speech', response_class=StreamingResponse)
    def speech(request_data: SpeechRequest):
        input = request_data.input
        speaker_ids = tts.hps.data.spk2id

        def audio_stream():
            bio = io.BytesIO()
            tts.tts_to_file(input, speaker_ids[request_data.voice], bio, speed=1, format='mp3')
            audio_data = bio.getvalue()
            yield audio_data

        return StreamingResponse(audio_stream(), media_type="audio/wav")

    return web_app
