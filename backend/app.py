from flask import Flask, jsonify, send_from_directory, request
from utils.agent import run_agent, mcp_server_manager
from utils.uagents.base_agent import BaseAgent
from utils.crawl import crawl_target_site


# Create a Flask application instance
app = Flask(__name__)

# instantiate all the agents we need


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

        discovered_pages = await crawl_target_site()

        return jsonify(
            {
                "message": f"Finished crawling {target_url}",
                "success": True,
                "discoveredPages": discovered_pages,
            }
        )

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


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


if __name__ == "__main__":
    # Run the application in debug mode
    # Debug mode should be turned off in production
    app.run(debug=True, host="0.0.0.0", port=3001)
