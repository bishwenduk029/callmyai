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
from pipecat.services.openai import OpenAILLMService, OpenAITTSService, OpenAILLMContext
from pipecat.transports.services.daily import DailyParams, DailyTransport
from pipecat.processors.frameworks.rtvi import RTVIProcessor, RTVIConfig
from pipecat.frames.frames import (
    LLMMessagesFrame,
    EndFrame
)
from pipecat.audio.vad.silero import SileroVADAnalyzer
from composio import Action
from composio_openai import ComposioToolSet, Action

from loguru import logger

from dotenv import load_dotenv
load_dotenv(override=True)

logger.remove(0)
logger.add(sys.stderr, level="INFO")

daily_api_key = os.getenv("DAILY_API_KEY", "")
daily_api_url = os.getenv("DAILY_API_URL", "https://api.daily.co/v1")

def create_composio_toolset(entity_id: str) -> ComposioToolSet:
    return ComposioToolSet(entity_id=entity_id)

class CallMyAIActionsProcessor:
    def __init__(self, entity_id, context: OpenAILLMContext, tools: list[str]):
        self.entity_id = entity_id
        composio_toolset = create_composio_toolset(entity_id)
        all_actions: list[Action] = []
        
        for tool_string in tools:
            parts = tool_string.split(" - ")
            if len(parts) == 2:
                action_string = parts[1].strip()
                try:
                    action_enum = getattr(Action, action_string)
                    all_actions.append(action_enum)
                except AttributeError:
                    logger.warning(f"Invalid action string: {action_string}")
            else:
                logger.warning(f"Invalid tool string format: {tool_string}")
        
        if all_actions:
            tool = composio_toolset.get_tools(actions=all_actions)
            context.set_tools(tool)
        else:
            logger.warning("No valid actions found in the provided tools.")
        

    async def some_handler(self, function_name, tool_call_id, args, llm, context, result_callback):
        toolset = create_composio_toolset("bishwenduk029@gmail.com")
        result =  toolset.execute_action(action=Action(value=function_name),
                params=args,
                entity_id=self.entity_id,)
        await result_callback([
            {
                "role": "system",
                "content": "Action execution was a success, continue the conversation and if needed update the user on the conversation context so far."
            }
        ])

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
        
        

        messages = client_config["config"]["llm"]["messages"]
        
        context = OpenAILLMContext(messages)
        context_aggregator = llm.create_context_aggregator(context)
        actions_owner_email = client_config["config"].get("actionsOwnerEmail")
        tools = client_config["config"].get("tools")
        
        if actions_owner_email and tools:
            logger.info(f"Actions Owner Email: {actions_owner_email}")
            call_handle = CallMyAIActionsProcessor(actions_owner_email, context, tools)
            llm.register_function(None, call_handle.some_handler)

        pipeline = Pipeline([
            transport.input(),
            context_aggregator.user(),
            llm,
            tts,
            transport.output(),
            context_aggregator.assistant(),
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
