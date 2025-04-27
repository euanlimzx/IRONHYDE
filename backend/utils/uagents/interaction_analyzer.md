# Action Analyzer Agent

![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)

## Description

This AI Agent automatically analyzes web pages to identify and generate comprehensive test cases for all interactive elements. Acting as an expert QA tester, it examines the entire page and creates detailed test scenarios, complete with step-by-step instructions and expected results for each interaction. Simply input a target URL to receive professionally crafted test cases that help identify potential bugs and ensure proper functionality.

## Features

- **Automated Test Case Generation**: Creates comprehensive test cases for all page elements
- **Visual Analysis**: Uses AI vision capabilities to identify UI components
- **Expert QA Perspective**: Approaches testing with professional QA methodology
- **Detailed Instructions**: Provides clear steps for each test case
- **Expected Results**: Defines success criteria for each interaction
- **No-Navigation Analysis**: Tests focus only on the current page view

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/action-analyzer-agent.git
cd action-analyzer-agent

# Install dependencies
pip install -r requirements.txt

# Install Playwright MCP
npm install @playwright/mcp@latest
```

## Usage

### Running the Agent

```bash
python -m action_analyzer
```

This will start the agent on port 8003 by default.

### API Reference

#### Input Data Model

```python
class ActionAnalyzerRequest(Model):
    target_page: str        # The URL of the page to analyze
```

#### Output Data Model

```python
class ActionAnalyzerResponse(Model):
    page_url: str           # The URL of the analyzed page
    interactions: list[InteractionToTest]  # List of test cases

class InteractionToTest(Model):
    interaction_description: str  # Description of the interaction to test
    expected_result: str    # Expected outcome of the interaction
```

### Example Request

```json
{
  "target_page": "https://example.com/login"
}
```

### Example Response

```json
{
  "page_url": "https://example.com/login",
  "interactions": [
    {
      "interaction_description": "Username Field Validation: Enter a valid username in the username field",
      "expected_result": "Field should accept input and show no validation errors"
    },
    {
      "interaction_description": "Password Field Validation: Enter a password with less than the minimum required characters",
      "expected_result": "Error message should appear indicating minimum password length requirement"
    },
    {
      "interaction_description": "Login Button: Click the login button without entering any credentials",
      "expected_result": "Form should display validation errors for both username and password fields"
    }
  ]
}
```

## Configuration

You can customize the agent by modifying the initialization parameters:

- `name`: Agent name (default: "interaction_analyzer")
- `seed`: Seed for agent identity generation (default: "interaction_analyzer_seed")
- `port_number`: Port for the REST API (default: 8003)

## Dependencies

- Python 3.8+
- uAgents framework
- LangChain
- OpenAI GPT-4o with vision capabilities
- Playwright (via MCP)

## Use Cases

- **QA Test Planning**: Automatically generate comprehensive test cases
- **Bug Detection**: Identify potential issues before they reach production
- **UI Validation**: Ensure all interface elements work as expected
- **Regression Testing**: Create consistent test cases for repeated testing
- **Test Coverage**: Ensure all page elements are included in testing
