from .base_agent import BaseAgent
from uagents import Model, Context
from typing import Optional
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from mcp_use import MCPAgent, MCPClient
from pathlib import Path


class SiteTesterRequest(Model):
    page_url: str
    interaction_description: str
    expected_result: str


class SiteTesterResponse(Model):
    test_passed: bool
    test_report: str


class SiteTester(BaseAgent):
    def __init__(
        self,
        name: str = "site_tester",
        seed: str = "site_tester_seed",
        port_number: int = 8004,
    ):

        current_dir = Path(__file__).parent.absolute()
        readme_path = current_dir / "site_tester.md"
        super().__init__(
            name=name,
            seed=seed,
            port_number=port_number,
            readme_path=readme_path,
        )

        self.init_mcp("--vision")

        @self.agent.on_rest_post(
            f"/agent/{name}", SiteTesterRequest, SiteTesterResponse
        )
        async def test_site_based_on_instruction(
            ctx: Context, request: SiteTesterRequest
        ) -> SiteTesterResponse:

            result = await self.mcp_agent.run(
                "You are an Automated QA testing Agent, and your task is to execute test instructions perfectly"
                "and generate a good report for the end users"
                "use browser_resize to set the dimensions of the browser to have width=1920 and height=1080"
                f"visit {request.page_url}"
                f"interaction with page: {request.interaction_description}"
                f"here is what you should expect: {request.expected_result}"
                """
                Respond with a JSON that adheres to the following pydantic model:
                class SiteTesterResponse(Model):
                    test_passed: bool
                    test_report: str
                """
                "After you are done with your task, make sure to free the browser resource using the browser_close tool"
            )

            json_data = self.extract_json_from_response(result)

            return json_data

    def init_mcp(self, additional_arg=None):
        args = ["@playwright/mcp@latest", "--vision"]

        config = {
            "mcpServers": {
                "playwright": {
                    "command": "npx",
                    "args": args,
                    "env": {"DISPLAY": ":99"},
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


if __name__ == "__main__":
    site_tester = SiteTester()
    import asyncio

    asyncio.run(site_tester.run_async())
