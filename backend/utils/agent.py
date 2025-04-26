import asyncio
import os, json
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from mcp_use import MCPAgent, MCPClient


async def run_agent():
    # Load environment variables
    load_dotenv()
    key = os.getenv("OPENAI_API_KEY")
    print(key)

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
            "{{success: bool, message: str}}"
        ),
    )

    # Run the query
    result = await agent.run(
        "visit https://the-internet.herokuapp.com/add_remove_elements/ and click add element.",
    )
    return json.loads(result)


if __name__ == "__main__":
    asyncio.run(run_agent())
