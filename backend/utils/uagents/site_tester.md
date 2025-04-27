# Site Tester Agent

![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)

## Description

This AI Agent automates website testing by visiting URLs and performing specified interactions to validate expected behavior. It leverages Playwright for browser automation and GPT-4o for intelligent test execution, providing comprehensive test reports based on your instructions. Simply input a URL, describe the interaction you want to test, and specify the expected results to get an automated test report.

## Features

- **Automated Web Testing**: Visit any website and automatically test user interactions
- **Vision Capabilities**: Understands visual elements on the page using AI vision
- **Comprehensive Reporting**: Provides clear pass/fail results with detailed test reports
- **Easy Integration**: Simple REST API interface for integration with your existing systems
- **Resource Management**: Automatically frees browser resources after test completion

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/site-tester-agent.git
cd site-tester-agent

# Install dependencies
pip install -r requirements.txt

# Install Playwright dependencies
npm install @playwright/mcp@latest
```

## Usage

### Running the Agent

```bash
python -m site_tester
```

This will start the agent on port 8004 by default.

### API Reference

#### Input Data Model

```python
class SiteTesterRequest(Model):
    page_url: str           # The URL of the website to test
    interaction_description: str  # Description of interactions to perform
    expected_result: str    # Description of the expected outcome
```

#### Output Data Model

```python
class SiteTesterResponse(Model):
    test_passed: bool       # Whether the test passed
    test_report: str        # Detailed report of the test results
```

### Example Request

```json
{
  "page_url": "https://example.com/login",
  "interaction_description": "Fill in the username field with 'testuser' and password field with 'password123', then click the login button",
  "expected_result": "User should be redirected to the dashboard page with a welcome message"
}
```

### Example Response

```json
{
  "test_passed": true,
  "test_report": "Successfully navigated to https://example.com/login. Filled username field with 'testuser' and password field with 'password123'. Clicked login button. Verification: User was successfully redirected to dashboard with welcome message 'Hello testuser' displayed at the top of the page."
}
```

## Configuration

You can customize the agent by modifying the initialization parameters:

- `name`: Agent name (default: "site_tester")
- `seed`: Seed for agent identity generation (default: "site_tester_seed")
- `port_number`: Port for the REST API (default: 8004)

## Dependencies

- Python 3.8+
- uAgents framework
- LangChain
- OpenAI GPT-4o
- Playwright (via MCP)
