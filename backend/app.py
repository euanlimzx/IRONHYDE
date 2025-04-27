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
import json, signal

load_dotenv(find_dotenv())

# Create a Flask application instance
app = Flask(__name__)

# instantiate all the agents we need
# html_analyzer = HtmlAnalyzer()

# fetch urls + interactions with each page
# url and the actions on the page, execute -> stream video


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
    try:
        # Get JSON data from request
        data = request.get_json()

        # Check if request has JSON data
        if not data:
            return jsonify({"error": "Missing JSON body in request"}), 400

        if (
            not data.get("page_url")
            or not data.get("interaction_description")
            or not data.get("expected_result")
        ):
            return (
                jsonify(
                    {
                        "error": "Missing required fields:  page_url: str, interaction_description: str, expected_result: str"
                    }
                ),
                400,
            )

        # Start recording
        process_ids = []
        try:
            # xvfb_process = await start_xvfb()
            # process_ids.append(xvfb_process.pid)

            # ffmpeg_process = await start_ffmpeg_recording()
            # process_ids.append(ffmpeg_process.pid)

            # Execute the test interaction
            result = requests.post(
                os.getenv("SITE_TESTER"),
                json={
                    "page_url": data.get("page_url"),
                    "interaction_description": data.get("interaction_description"),
                    "expected_result": data.get("expected_result"),
                },
            )

            # Stop recording
            # await stop_ffmpeg_recording(ffmpeg_process)
            # await stop_xvfb(xvfb_process)
            # await clean_ffmpeg_stream()

            return result.json()

        except Exception as e:
            # Ensure processes are cleaned up on error
            for pid in process_ids:
                try:
                    os.kill(pid, signal.SIGTERM)
                except ProcessLookupError:
                    pass
            raise e

    except Exception as e:
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
    # Run both services using asyncio
    asyncio.run(start_services())
