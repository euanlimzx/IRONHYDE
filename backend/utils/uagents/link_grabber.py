from .base_agent import BaseAgent
from uagents import Model, Context
from pathlib import Path


class LinkGrabRequest(Model):
    start_page: str


class LinkGrabResponse(Model):
    linked_pages: list[str]


class LinkGrabber(BaseAgent):
    def __init__(
        self,
        name: str = "link_grabber",
        seed: str = "link_grabber_seed",
        port_number: int = 8002,
    ):
        current_dir = Path(__file__).parent.absolute()
        readme_path = current_dir / "link_grabber.md"
        super().__init__(
            name=name,
            seed=seed,
            port_number=port_number,
            readme_path=readme_path,
        )

        self.init_mcp()

        @self.agent.on_rest_post(f"/agent/{name}", LinkGrabRequest, LinkGrabResponse)
        async def analyze_html(
            ctx: Context, request: LinkGrabRequest
        ) -> LinkGrabResponse:
            target_site = request.start_page

            result = await self.mcp_agent.run(
                f"visit {target_site}"
                f"Find me all the pages within the same domain that {target_site} will link me to"
                "Your response should strictly be a list of the full urls that can be parsed as a JSON"
                "Only respond in markdown"
                "After you are done with your task, make sure to free the browser resource using the browser_close tool"
            )

            print(result)

            return LinkGrabResponse(linked_pages=self.get_array_from_md(result))


if __name__ == "__main__":
    link_grabber = LinkGrabber()
    import asyncio

    asyncio.run(link_grabber.run_async())
