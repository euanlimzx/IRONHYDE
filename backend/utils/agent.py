import asyncio
import os, json
from dotenv import load_dotenv, find_dotenv
from langchain_openai import ChatOpenAI
from mcp_use import MCPAgent, MCPClient
from mcp_use.adapters.langchain_adapter import LangChainAdapter

load_dotenv(find_dotenv())
key = os.getenv("OPENAI_API_KEY")


async def run_agent():
    # Create configuration dictionary
    config = {
        "mcpServers": {
            "playwright": {
                "command": "npx",
                "args": ["@playwright/mcp@latest"],
                "env": {"DISPLAY": ":1"},
            }
        }
    }

    # Create MCPClient from configuration dictionary
    client = MCPClient.from_dict(config)

    # Create LLM
    llm = ChatOpenAI(model="gpt-4o")

    # Create agent with the client
    agent = MCPAgent(
        llm=llm,
        client=client,
        max_steps=30,
        system_prompt=(
            "Return your result as a JSON of the following format:"
            "{{success: bool, message: str, captured_network_requests: str}}"
        ),
    )

    # Run the query
    result = await agent.run(
        "visit https://the-internet.herokuapp.com/add_remove_elements/ and click add element."
    )

    return json.loads(result)


async def mcp_server_manager():
    adapter = LangChainAdapter()

    # Create configuration dictionary
    config = {
        "mcpServers": {
            "playwright": {
                "command": "npx",
                "args": ["@playwright/mcp@latest"],
                "env": {"DISPLAY": ":1"},
            }
        }
    }

    # Create MCPClient from configuration dictionary
    client = MCPClient.from_dict(config)

    agent = MCPAgent(
        llm=ChatOpenAI(model="gpt-4o"),
        client=client,
        use_server_manager=True,  # Enable the Server Manager
        max_steps=30,
    )

    result = await agent.run(
        "visit https://the-internet.herokuapp.com/add_remove_elements/ and click add element."
        "Use the browser_take_screenshot tool to take a screenshot of the full page and save the image to the /Users/shawnwei/Developer/UCLA/Personal/LA-Hacks/backend/static folder"
        "Tell me where the screenshot is saved to"
    )

    print(result)


if __name__ == "__main__":
    asyncio.run(mcp_server_manager())
