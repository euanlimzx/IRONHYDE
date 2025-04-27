from uagents import Agent, Context
import time
import os, json, re
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from mcp_use import MCPAgent, MCPClient


class BaseAgent:
    def __init__(self, name: str, seed: str, port_number: int, readme_path: str):
        self.name = name

        # 1. Create the agent instance
        self.agent = Agent(
            name=name,
            seed=seed,
            port=port_number,
            endpoint=[f"http://127.0.0.1:{port_number}/submit"],
            readme_path=readme_path,
        )

        print(self.agent._readme)

        # Register the default startup handler
        @self.agent.on_event("startup")
        async def startup_function(ctx: Context):
            ctx.logger.info(
                f"Hello, I'm agent {self.name} and my address is {self.agent.address}."
            )

    def register_startup_handler(self, handler_func):
        """Override the default startup handler with a custom one"""
        self.agent.on_event("startup")(handler_func)

    def register_message_handler(self, message_model, handler_func):
        """Register a message handler for a specific model"""
        self.agent.on_message(message_model)(handler_func)

    def register_event_handler(self, event_name, handler_func):
        """Register a custom event handler"""
        self.agent.on_event(event_name)(handler_func)

    async def run_async(self):
        """Run the agent"""
        await self.agent.run_async()

    def get_array_from_md(self, input):
        pattern = r'\[\s*"[^"]*"(?:\s*,\s*"[^"]*")*\s*\]'
        match = re.search(pattern, input)
        if match:
            array_str = match.group(0)
            return json.loads(array_str)
        return []

    def extract_json_from_response(self, response):
        """Extract any valid JSON object from a text response containing markdown and other content."""
        pattern = r"(?<=```json\s).*?(?=\s*```)"
        match = re.search(pattern, response, re.DOTALL)
        if match:
            json_str = match.group(0)
            # Validate that it's proper JSON
            try:
                parsed_json = json.loads(json_str)
                return parsed_json
            except json.JSONDecodeError:
                return "Invalid JSON found"
        else:
            return {}

    def initialize_llm(self):
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            print("❌ OPENAI_API_KEY not found in environment.")
            raise ValueError

        self.llm = ChatOpenAI(model="gpt-4o", openai_api_key=key)

    def init_mcp(self, additional_arg=None):
        args = [
            "@playwright/mcp@latest",
            "--headless",
        ]

        if additional_arg:
            args.append(additional_arg)

        # Create configuration dictionary
        config = {
            "mcpServers": {
                "playwright": {
                    "command": "npx",
                    "args": args,
                    "env": {"DISPLAY": ":1"},
                }
            }
        }

        # Create MCPClient from configuration dictionary
        client = MCPClient.from_dict(config)

        self.mcp_agent = MCPAgent(
            llm=ChatOpenAI(model="gpt-4o"),
            client=client,
            use_server_manager=True,  # Enable the Server Manager
            max_steps=30,
        )


# Example usage:
if __name__ == "__main__":
    # Create an agent
    alice = BaseAgent(name="alice", seed="secret_seed_phrase")

    # Run the agent
    alice.run()
