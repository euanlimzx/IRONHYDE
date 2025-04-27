from flask import Flask, jsonify, send_from_directory, request
from utils.agent import run_agent, mcp_server_manager
from utils.uagents.interaction_analyzer import ActionAnalyzer
from utils.uagents.link_grabber import LinkGrabber
from utils.uagents.site_tester import SiteTester
from utils.video_streaming import (
    start_xvfb,
    start_ffmpeg_recording,
    stop_xvfb,
    stop_ffmpeg_recording,
    clean_ffmpeg_stream,
)
import requests, os
from dotenv import load_dotenv, find_dotenv
import asyncio
from hypercorn.config import Config
from hypercorn.asyncio import serve
import signal
import uuid
import time
from datetime import datetime
from pathlib import Path

load_dotenv(find_dotenv())

# Create a Flask application instance
app = Flask(__name__)

# Global recording state
recording_state = {
    "is_recording": False,
    "xvfb_process": None,
    "ffmpeg_process": None,
    "session_id": None,
    "output_dir": None,
    "current_output_file": None,
    "start_time": None,
}

# Create videos directory if it doesn't exist
VIDEOS_DIR = Path("./videos")
VIDEOS_DIR.mkdir(exist_ok=True)


# Route for the home page
@app.route("/")
def home():
    return "Hello World! Welcome to my Flask server."


@app.post("/crawl-and-get-tests")
async def crawl():
    try:
        # Get JSON data from request
        data = request.get_json()

        # Check if request has JSON data
        if not data:
            return jsonify({"error": "Missing JSON body in request"}), 400

        # Validate targetUrl parameter
        target_url = data.get("targetUrl")
        if not target_url:
            return (
                jsonify(
                    {"error": "Missing required parameter 'targetUrl' in request body"}
                ),
                400,
            )

        # Basic URL format validation
        if not target_url.startswith(("http://", "https://")):
            return (
                jsonify(
                    {
                        "error": "Invalid URL format. URL must start with http:// or https://"
                    }
                ),
                400,
            )

        # get the related URLs
        related_urls = requests.post(
            url=os.getenv("LINK_GRABBER"), json={"start_page": target_url}
        )

        # just test with the first 5
        related_urls = related_urls.json().get("linked_pages", [])[:2]

        print(related_urls)

        page_analyes = []
        for url in related_urls:
            page_interactions = requests.post(
                url=os.getenv("INTERACTION_ANALYZER"), json={"target_page": url}
            )
            print(page_interactions.json())
            page_analyes.append(page_interactions.json())

        return jsonify(page_analyes)

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.post("/test-interaction")
async def test_interaction():
    global recording_state

    try:
        # Get JSON data from request
        data = request.get_json()

        # Check if request has JSON data
        if not data:
            return jsonify({"error": "Missing JSON body in request"}), 400

        # Handle recording control commands
        command = data.get("command", "").lower()

        if command == "start":
            # Start a new recording session if not already recording
            if recording_state["is_recording"]:
                return jsonify(
                    {
                        "success": False,
                        "message": "Recording already in progress",
                        "session_id": recording_state["session_id"],
                    }
                )

            # Generate session ID and create output directory
            session_id = str(uuid.uuid4())
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_dir = VIDEOS_DIR / f"session_{timestamp}_{session_id[:8]}"
            output_dir.mkdir(exist_ok=True)

            # Start xvfb
            xvfb_process = await start_xvfb()

            # Start ffmpeg recording
            output_file = output_dir / "recording.mp4"
            ffmpeg_process = await start_ffmpeg_recording(str(output_file))

            # Update recording state
            recording_state = {
                "is_recording": True,
                "xvfb_process": xvfb_process,
                "ffmpeg_process": ffmpeg_process,
                "session_id": session_id,
                "output_dir": output_dir,
                "current_output_file": output_file,
                "start_time": time.time(),
            }

            return jsonify(
                {
                    "success": True,
                    "message": "Recording started",
                    "session_id": session_id,
                }
            )

        elif command == "stop":
            # Stop the current recording session
            if not recording_state["is_recording"]:
                return jsonify(
                    {"success": False, "message": "No recording in progress"}
                )

            # Stop recording processes
            await stop_ffmpeg_recording(recording_state["ffmpeg_process"])
            await stop_xvfb(recording_state["xvfb_process"])
            await clean_ffmpeg_stream()

            # Calculate recording duration
            duration = time.time() - recording_state["start_time"]

            # Get session info before resetting
            session_info = {
                "session_id": recording_state["session_id"],
                "output_file": str(recording_state["current_output_file"]),
                "duration": duration,
            }

            # Reset recording state
            recording_state = {
                "is_recording": False,
                "xvfb_process": None,
                "ffmpeg_process": None,
                "session_id": None,
                "output_dir": None,
                "current_output_file": None,
                "start_time": None,
            }

            return jsonify(
                {
                    "success": True,
                    "message": "Recording stopped",
                    "recording_info": session_info,
                }
            )

        elif command == "status":
            # Return current recording status
            if recording_state["is_recording"]:
                duration = time.time() - recording_state["start_time"]
                return jsonify(
                    {
                        "is_recording": True,
                        "session_id": recording_state["session_id"],
                        "duration": duration,
                        "output_file": str(recording_state["current_output_file"]),
                    }
                )
            else:
                return jsonify({"is_recording": False})

        # If no command is specified, handle as a regular test interaction
        if (
            not data.get("page_url")
            or not data.get("interaction_description")
            or not data.get("expected_result")
        ):
            return (
                jsonify(
                    {
                        "error": "Missing required fields: page_url: str, interaction_description: str, expected_result: str"
                    }
                ),
                400,
            )

        # Execute the test interaction - if we're recording, it will be captured
        result = requests.post(
            os.getenv("SITE_TESTER"),
            json={
                "page_url": data.get("page_url"),
                "interaction_description": data.get("interaction_description"),
                "expected_result": data.get("expected_result"),
            },
        )

        # Return test results along with recording info if applicable
        response_data = result.json()
        if recording_state["is_recording"]:
            response_data["recording"] = {
                "is_recording": True,
                "session_id": recording_state["session_id"],
            }

        return jsonify(response_data)

    except Exception as e:
        # Ensure processes are cleaned up on error
        if recording_state["is_recording"]:
            try:
                if recording_state["ffmpeg_process"]:
                    await stop_ffmpeg_recording(recording_state["ffmpeg_process"])
                if recording_state["xvfb_process"]:
                    await stop_xvfb(recording_state["xvfb_process"])
                await clean_ffmpeg_stream()
            except Exception as cleanup_error:
                print(f"Error during cleanup: {cleanup_error}")

            # Reset recording state on error
            recording_state = {
                "is_recording": False,
                "xvfb_process": None,
                "ffmpeg_process": None,
                "session_id": None,
                "output_dir": None,
                "current_output_file": None,
                "start_time": None,
            }

        return (
            jsonify({"success": False, "error": f"Test execution failed: {str(e)}"}),
            500,
        )


@app.route("/test-site")
async def run_testing_agent():
    result = await run_agent()

    if not result.get("success"):
        print(result.get("message"))
        return "Error encountered when running tests on the site"

    return jsonify(result)


@app.get("/image")
async def get_associated_screenshot():
    result = await mcp_server_manager()

    return "NICE"


# Custom 404 error handler
@app.errorhandler(404)
def page_not_found(e):
    return "Page not found!", 404


# Graceful shutdown handler
async def shutdown_handler():
    global recording_state

    # Clean up recording if in progress
    if recording_state["is_recording"]:
        try:
            if recording_state["ffmpeg_process"]:
                await stop_ffmpeg_recording(recording_state["ffmpeg_process"])
            if recording_state["xvfb_process"]:
                await stop_xvfb(recording_state["xvfb_process"])
            await clean_ffmpeg_stream()
        except Exception as e:
            print(f"Error during shutdown cleanup: {e}")


async def start_services():
    # Start the HTML Analyzer in the background
    link_grabber = LinkGrabber()
    link_grabber_task = asyncio.create_task(link_grabber.agent.run_async())

    action_analyzer = ActionAnalyzer()
    action_analyzer_task = asyncio.create_task(action_analyzer.agent.run_async())

    site_tester = SiteTester()
    site_tester_task = asyncio.create_task(site_tester.run_async())

    # Start the Flask app with Hypercorn
    config = Config()
    config.bind = ["0.0.0.0:3001"]
    config.worker_class = "asyncio"
    config.debug = True

    try:
        await serve(app, config)
    finally:
        # Clean up recording if server shuts down
        await shutdown_handler()

        # Ensure analyzer task is cleaned up
        link_grabber_task.cancel()
        action_analyzer_task.cancel()
        site_tester_task.cancel()

        try:
            await link_grabber_task
            await action_analyzer_task
            await site_tester_task

        except asyncio.CancelledError:
            pass


if __name__ == "__main__":
    # Register signal handlers for graceful shutdown
    for sig in (signal.SIGINT, signal.SIGTERM):
        signal.signal(sig, lambda s, f: asyncio.ensure_future(shutdown_handler()))

    # Run both services using asyncio
    asyncio.run(start_services())
