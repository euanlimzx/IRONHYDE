from flask import Flask
from utils.agent import run_agent

# Create a Flask application instance
app = Flask(__name__)


# Route for the home page
@app.route("/")
def home():
    return "Hello World! Welcome to my Flask server."


@app.route("/test-site")
async def run_testing_agent():
    result = await run_agent()

    if not result.get("success"):
        print(result.get("message"))
        return "Error encountered when running tests on the site"

    return "Yay"


# Custom 404 error handler
@app.errorhandler(404)
def page_not_found(e):
    return "Page not found!", 404


if __name__ == "__main__":
    # Run the application in debug mode
    # Debug mode should be turned off in production
    app.run(debug=True, host="0.0.0.0", port=3001)
