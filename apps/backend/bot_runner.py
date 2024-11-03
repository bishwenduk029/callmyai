#
# Copyright (c) 2024, Daily
#
# SPDX-License-Identifier: BSD 2-Clause License
#

import aiohttp
import argparse
import subprocess
import os
import json

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from pipecat.transports.services.helpers.daily_rest import (
    DailyRESTHelper, DailyRoomObject, DailyRoomProperties, DailyRoomParams, DailyRoomSipParams)

from dotenv import load_dotenv
load_dotenv(override=True)


# ------------ Configuration ------------ #

MAX_SESSION_TIME = 1 * 60  # 1 minute
REQUIRED_ENV_VARS = [
    'DAILY_API_KEY',
    'OPENAI_API_KEY',
    'FLY_API_KEY',
    'FLY_APP_NAME',]

FLY_API_HOST = os.getenv("FLY_API_HOST", "https://api.machines.dev/v1")
FLY_APP_NAME = os.getenv("FLY_APP_NAME", "")
FLY_API_KEY = os.getenv("FLY_API_KEY", "")
FLY_HEADERS = {
    'Authorization': f"Bearer {FLY_API_KEY}",
    'Content-Type': 'application/json'
}

daily_helpers = {}


# ----------------- API ----------------- #

@asynccontextmanager
async def lifespan(app: FastAPI):
    aiohttp_session = aiohttp.ClientSession()
    daily_helpers["rest"] = DailyRESTHelper(
        daily_api_key=os.getenv("DAILY_API_KEY", ""),
        daily_api_url=os.getenv("DAILY_API_URL", 'https://api.daily.co/v1'),
        aiohttp_session=aiohttp_session
    )
    yield
    await aiohttp_session.close()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGIN")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ----------------- Main ----------------- #


async def spawn_fly_machine(room_url: str, token: str, client_config: dict):
    async with aiohttp.ClientSession() as session:
        # Use the same image as the bot runner
        async with session.get(f"{FLY_API_HOST}/apps/{FLY_APP_NAME}/machines", headers=FLY_HEADERS) as r:
            if r.status != 200:
                text = await r.text()
                raise Exception(f"Unable to get machine info from Fly: {text}")

            data = await r.json()
            image = data[0]['config']['image']

        # Machine configuration
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as temp_file:
                json.dump(client_config, temp_file)
                temp_file_path = temp_file.name
        cmd = f"python3 bot.py -u {room_url} -t {token} -c @{temp_file_path}"
        cmd = cmd.split()
        worker_props = {
            "config": {
                "image": image,
                "auto_destroy": True,
                "init": {
                    "cmd": cmd
                },
                "restart": {
                    "policy": "no"
                },
                "guest": {
                    "cpu_kind": "shared",
                    "cpus": 1,
                    "memory_mb": 2048
                }
            },
        }

        # Spawn a new machine instance
        async with session.post(f"{FLY_API_HOST}/apps/{FLY_APP_NAME}/machines", headers=FLY_HEADERS, json=worker_props) as r:
            if r.status != 200:
                text = await r.text()
                raise Exception(f"Problem starting a bot worker: {text}")

            data = await r.json()
            # Wait for the machine to enter the started state
            vm_id = data['id']

        async with session.get(f"{FLY_API_HOST}/apps/{FLY_APP_NAME}/machines/{vm_id}/wait?state=started", headers=FLY_HEADERS) as r:
            if r.status != 200:
                text = await r.text()
                raise Exception(f"Bot was unable to enter started state: {text}")


@app.post("/start_bot")
async def start_bot(request: Request) -> JSONResponse:
    try:
        client_config = await request.json()
        # Is this a webhook creation request?
        if "test" in client_config:
            return JSONResponse({"test": True})
    except Exception as e:
        pass

    # Use specified room URL, or create a new one if not specified
    room_url = os.getenv("DAILY_SAMPLE_ROOM_URL", "")

    if not room_url:
        if(client_config["config"]["sip"]["enabled"]):
            params = DailyRoomParams(
                properties=DailyRoomProperties(sip=DailyRoomSipParams( display_name="dialin-user", video=False, sip_mode="dial-in", num_endpoints=1))
            )
        else:
            params = DailyRoomParams(
                properties=DailyRoomProperties()
        )
        try:
            room: DailyRoomObject = await daily_helpers["rest"].create_room(params=params)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Unable to provision room {e}")
    else:
        # Check passed room URL exists, we should assume that it already has a sip set up
        try:
            room: DailyRoomObject = await daily_helpers["rest"].get_room_from_url(room_url)
        except Exception:
            raise HTTPException(
                status_code=500, detail=f"Room not found: {room_url}")

    # Give the agent a token to join the session
    token = await daily_helpers["rest"].get_token(room.url, MAX_SESSION_TIME)

    if not room or not token:
        raise HTTPException(
            status_code=500, detail=f"Failed to get token for room: {room_url}")

    # Launch a new fly.io machine, or run as a shell process (not recommended)
    run_as_process = os.getenv("RUN_AS_PROCESS", False)

    if run_as_process:
        try:
            # Serialize the client_config to a temporary file
            import tempfile
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as temp_file:
                json.dump(client_config, temp_file)
                temp_file_path = temp_file.name

            cmd = [
                "python3",
                "-m",
                "bot",
                "-u", room.url,
                "-t", token,
                "-c", f"@{temp_file_path}"  # Use file input for client_config
            ]
            subprocess.Popen(
                cmd,
                cwd=os.path.dirname(os.path.abspath(__file__)))
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to start subprocess: {e}")
    else:
        try:
            await spawn_fly_machine(room.url, token, client_config)
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to spawn VM: {e}")

    # Grab a token for the user to join with
    user_token = await daily_helpers["rest"].get_token(room.url, MAX_SESSION_TIME)

    return JSONResponse({
        "room_url": room.url,
        "token": user_token,
        "room_name": room.name,
    })

if __name__ == "__main__":
    # Check environment variables
    for env_var in REQUIRED_ENV_VARS:
        if env_var not in os.environ:
            raise Exception(f"Missing environment variable: {env_var}.")

    parser = argparse.ArgumentParser(description="Pipecat Bot Runner")
    parser.add_argument("--host", type=str,
                        default=os.getenv("HOST", "0.0.0.0"), help="Host address")
    parser.add_argument("--port", type=int,
                        default=os.getenv("PORT", 7860), help="Port number")
    parser.add_argument("--reload", action="store_true",
                        default=False, help="Reload code on change")

    config = parser.parse_args()

    try:
        import uvicorn

        uvicorn.run(
            "bot_runner:app",
            host=config.host,
            port=config.port,
            reload=config.reload
        )
    except KeyboardInterrupt:
        print("Pipecat runner shutting down...")
