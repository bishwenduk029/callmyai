import asyncio
import aiohttp
import os
import sys
import argparse
import json
import hmac
import hashlib

from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_response import LLMAssistantResponseAggregator, LLMUserResponseAggregator
from pipecat.frames.frames import EndFrame
from pipecat.services.openai import OpenAILLMService, OpenAITTSService
from pipecat.transports.services.daily import DailyParams, DailyTransport
from pipecat.processors.frameworks.rtvi import RTVIProcessor, RTVIConfig
from pipecat.frames.frames import (
    LLMMessagesFrame,
    EndFrame
)
from pipecat.vad.silero import SileroVADAnalyzer

from loguru import logger

from dotenv import load_dotenv
load_dotenv(override=True)

logger.remove(0)
logger.add(sys.stderr, level="INFO")

daily_api_key = os.getenv("DAILY_API_KEY", "")
daily_api_url = os.getenv("DAILY_API_URL", "https://api.daily.co/v1")

def load_config(config_arg):
    if config_arg.startswith('@'):
        with open(config_arg[1:], 'r') as f:
            return json.load(f)
    else:
        return json.loads(config_arg)


async def main(room_url: str, token: str, client_config: dict):
    logger.info(f"Client Config: {client_config}")
    async with aiohttp.ClientSession() as session:
        transport = DailyTransport(
            room_url,
            token,
            "Chatbot",
            DailyParams(
                api_url=daily_api_url,
                api_key=daily_api_key,
                audio_in_enabled=True,
                audio_out_enabled=True,
                camera_out_enabled=False,
                vad_enabled=True,
                vad_analyzer=SileroVADAnalyzer(),
                transcription_enabled=True,
                audio_in_sample_rate=24000,
                audio_out_sample_rate=24000,
            )
        )

        tts = OpenAITTSService(
            api_key=os.getenv("OPENAI_API_KEY"),
            voice="nova",
        )

        llm = OpenAILLMService(
            api_key=os.getenv("OPENAI_API_KEY"),
            model="gpt-4o-mini")

        messages = [
            {
                "role": "system",
                "content": client_config["config"]["llm"]["messages"][0]["content"],
            },
        ]

        tma_in = LLMUserResponseAggregator(messages)
        tma_out = LLMAssistantResponseAggregator(messages)

        pipeline = Pipeline([
            transport.input(),
            tma_in,
            llm,
            tts,
            transport.output(),
            tma_out
        ])

        task = PipelineTask(pipeline, PipelineParams(allow_interruptions=True))

        @transport.event_handler("on_first_participant_joined")
        async def on_first_participant_joined(transport, participant):
            transport.capture_participant_transcription(participant["id"])
            await task.queue_frames([LLMMessagesFrame(messages)])

        @transport.event_handler("on_participant_left")
        async def on_participant_left(transport, participant, reason):
            
            chat_id = client_config["config"]["chatId"]
            summary_url = "https://www.callmyai.app/api/summary"
            
            try:
                async with aiohttp.ClientSession() as session:
                    # Prepare the payload
                    payload = {
                        "chatId": chat_id,
                        "chatTranscripts": messages
                    }
                    raw_body = json.dumps(payload)
                    
                    # Compute HMAC signatureØ
                    api_secret_key = os.getenv("API_SECRET_KEY", "").encode()
                    signature = hmac.new(api_secret_key, raw_body.encode(), hashlib.sha256).hexdigest()

                    # Send the request with raw body and signature
                    async with session.post(
                        summary_url, 
                        data=raw_body,
                        headers={
                            "Content-Type": "application/json",
                            "X-Signature": signature
                        }
                    ) as response:
                        if response.status == 200:
                            logger.info("Summary created successfully")
                        else:
                            logger.error(f"Failed to create summary. Status: {response.status}")
            except Exception as e:
                logger.error(f"Error creating summary: {str(e)}")
            
            await task.queue_frame(EndFrame())

        @transport.event_handler("on_call_state_updated")
        async def on_call_state_updated(transport, state):
            if state == "left":
                await task.queue_frame(EndFrame())

        runner = PipelineRunner()

        await runner.run(task)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pipecat Bot")
    parser.add_argument("-u", type=str, help="Room URL")
    parser.add_argument("-t", type=str, help="Token")
    parser.add_argument("-c", "--config", type=load_config, required=True, help="Client configuration")
    config = parser.parse_args()

    asyncio.run(main(config.u, config.t, config.config))
