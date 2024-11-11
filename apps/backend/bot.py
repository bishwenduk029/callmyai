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
from pipecat.transports.services.daily import DailyParams, DailyTransport, DailyDialinSettings
from openai.types.chat.chat_completion_tool_param import ChatCompletionToolParam
from pipecat.processors.frameworks.rtvi import RTVIProcessor, RTVIConfig
from carbon import Carbon
from pipecat.frames.frames import (
    LLMMessagesFrame,
    EndFrame
)
from pipecat.audio.vad.silero import SileroVADAnalyzer
from composio import Action
from composio_openai import ComposioToolSet, Action
from typing import Optional, Dict, Any
from pipecat.services.playht import PlayHTTTSService
from pipecat.services.ai_services import TTSService
from pipecat.transcriptions.language import Language

from twilio.rest import Client

from loguru import logger

from dotenv import load_dotenv
load_dotenv(override=True)

logger.remove(0)
logger.add(sys.stderr, level="INFO")

daily_api_key = os.getenv("DAILY_API_KEY", "")
daily_api_url = os.getenv("DAILY_API_URL", "https://api.daily.co/v1")

twilio_account_sid = os.getenv("TWILIO_ACCOUNT_SID")
twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN")
twilioclient = Client(twilio_account_sid, twilio_auth_token)

class TTSFactory:
    @staticmethod
    def create_tts_service(config: Optional[Dict[str, Any]] = None) -> TTSService:
        if not config:
            return OpenAITTSService(api_key=os.getenv("OPENAI_API_KEY"))
        
        provider = config.get("provider", "openai").lower()
        
        if provider == "openai":
            return OpenAITTSService(
                api_key=os.getenv("OPENAI_API_KEY"),
                voice=config.get("voice", "nova")
            )
        elif provider == "playht":
            return PlayHTTTSService(
                user_id=os.getenv("PLAYHT_USER_ID"),
                api_key=os.getenv("PLAYHT_API_KEY"),
                voice_url=config.get("voice", "s3://voice-cloning-zero-shot/801a663f-efd0-4254-98d0-5c175514c3e8/jennifer/manifest.json"),
                params=PlayHTTTSService.InputParams(language=Language.EN)
            )
            
        # Default to OpenAI if provider is not recognized
        return OpenAITTSService(api_key=os.getenv("OPENAI_API_KEY"), voice="nova") 

def create_composio_toolset(entity_id: str) -> ComposioToolSet:
    return ComposioToolSet(entity_id=entity_id)

class CallMyAIActionsProcessor:
    def __init__(self, entity_id, context: OpenAILLMContext, tools: list[str], data_sources: list[str]):
        self.entity_id = entity_id
        self.composio_toolset = create_composio_toolset(entity_id)
        all_actions: list[Action] = []
        abilities: list[ChatCompletionToolParam] = []
        user_carbon_access_wrapper = Carbon(api_key=os.getenv("CARBON_API_KEY"), customer_id=entity_id)
        carbon_access_token_result = user_carbon_access_wrapper.auth.get_access_token()
        self.carbon_access_token = carbon_access_token_result.access_token
        self.data_sources = [
            int(source["fileId"]) 
            for source in data_sources if isinstance(source, dict)
        ]
        
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
            abilities = self.composio_toolset.get_tools(actions=all_actions)
        else:
            logger.warning("No valid actions found in the provided tools.")
        
        # Register file handler if file_ids are present
        logger.info(f"Data Sources: {self.data_sources}")
        if self.data_sources:
            rag_query_tool: ChatCompletionToolParam = {
                "type": "function",
                "function": {
                    "name": "query_knowledge_base",
                    "description": "Query the knowledge base using RAG (Retrieval-Augmented Generation)",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "The query to search in the knowledge base"
                            },
                        },
                        "required": ["query"]
                    }
                }
            }
            abilities.append(rag_query_tool)
            logger.info(f"RAG Query Tool: {rag_query_tool}")
        
        context.set_tools(abilities)

    async def generic_handler(self, function_name, tool_call_id, args, llm, context, result_callback):
        result = self.composio_toolset.execute_action(
            action=Action(value=function_name),
            params=args,
            entity_id=self.entity_id,
        )
        result_json = json.dumps(result)
        await result_callback([
            {
                "role": "tool",
                "content": f"Action execution was successful. Here's the result: {result_json}. Please interpret this result and continue the conversation, updating the user on the context as needed. Remeber not all tool calls response need to be updated to users, make the best judgement call on what to show to the user."
            }
        ])

    async def query_knowledge_base(self, function_name, tool_call_id, args, llm, context, result_callback):
        # This is the empty handler method for file operations
        # You can fill this in with the actual implementation
        carbon_api = Carbon(access_token=self.carbon_access_token)
        document_response_list = carbon_api.embeddings.get_documents(query=args["query"], k=1, file_ids=self.data_sources, include_all_children=False, include_file_level_metadata=False, include_vectors=False, hybrid_search=False, high_accuracy=False, rerank=None, validate=True, include_tags=True)
        if document_response_list and len(document_response_list.documents) > 0:
            retrieved_content = document_response_list.documents[0].content
            # Log the retrieved content for debugging
            logger.info(f"Retrieved content: {retrieved_content}")
            rag_prompt = f"""Based on the following retrieved information and the user's query, please provide a relevant and concise answer. Consider the conversation history for context.

Retrieved Information:
{retrieved_content}

User Query:
{args["query"]}

Please use this information to formulate a response that addresses the user's query while maintaining context from the conversation history. If the retrieved information is not directly relevant, use your general knowledge to provide the best possible answer."""

            await result_callback([
                {
                    "role": "tool",
                    "content": rag_prompt
                }
            ])
        else:
            await result_callback([
                {
                    "role": "tool",
                    "content": "No relevant information found in the knowledge base. Please provide a response based on your general knowledge and the conversation history."
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

        tts_config = client_config.get("config", {}).get("tts", {})
        tts = TTSFactory.create_tts_service(tts_config)

        llm = OpenAILLMService(
            api_key=os.getenv("OPENAI_API_KEY"),
            model="gpt-4o-mini")
        
        

        messages = client_config["config"]["llm"]["messages"]
        
        context = OpenAILLMContext(messages)
        context_aggregator = llm.create_context_aggregator(context)
        actions_owner_email = client_config["config"].get("actionsOwnerEmail")
        tools = client_config["config"].get("tools")
        data_sources = client_config["config"].get("dataSources", [])  # Get fileIDs from config
        
        if actions_owner_email and (tools or data_sources):
            logger.info(f"Actions Owner Email: {actions_owner_email}")
            call_handle = CallMyAIActionsProcessor(actions_owner_email, context, tools, data_sources)
            llm.register_function(None, call_handle.generic_handler)
            if data_sources:
                llm.register_function("query_knowledge_base", call_handle.query_knowledge_base)

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
            await transport.capture_participant_transcription(participant["id"])
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
        
        @transport.event_handler("on_dialin_ready")
        async def on_dialin_ready(transport, cdata):
            # For Twilio, Telnyx, etc. You need to update the state of the call
            # and forward it to the sip_uri..
            sip_uri = client_config["config"]["sip"]["endpoint"]
            call_id = client_config["config"]["sip"]["callId"]
            print(f"Forwarding call: {sip_uri}")

            try:
                # The TwiML is updated using Twilio's client library
                call = twilioclient.calls(call_id).update(
                    twiml=f"<Response><Dial><Sip>{sip_uri}</Sip></Dial></Response>"
                )
            except Exception as e:
                raise Exception(f"Failed to forward call: {str(e)}")

        runner = PipelineRunner()

        await runner.run(task)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pipecat Bot")
    parser.add_argument("-u", type=str, help="Room URL")
    parser.add_argument("-t", type=str, help="Token")
    parser.add_argument("-c", "--config", type=load_config, required=True, help="Client configuration")
    config = parser.parse_args()

    asyncio.run(main(config.u, config.t, config.config))
