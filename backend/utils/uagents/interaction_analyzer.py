from .base_agent import BaseAgent
from uagents import Model, Context
from typing import Optional


class ActionAnalyzerRequest(Model):
    target_page: str


class InteractionToTest(Model):
    interaction_description: str
    expected_result: str


class ActionAnalyzerResponse(Model):
    page_url: str
    interactions: list[InteractionToTest]


class ActionAnalyzer(BaseAgent):
    def __init__(
        self,
        name: str = "interaction_analyzer",
        seed: str = "interaction_analyzer_seed",
        port_number: int = 8003,
    ):
        super().__init__(
            name=name,
            seed=seed,
            port_number=port_number,
        )

        self.init_mcp("--vision")

        @self.agent.on_rest_post(
            f"/agent/{name}", ActionAnalyzerRequest, ActionAnalyzerResponse
        )
        async def analyze_html(
            ctx: Context, request: ActionAnalyzerRequest
        ) -> ActionAnalyzerResponse:

            result = await self.mcp_agent.run(
                f"visit {request.target_page}"
                f"You are an expert QA tester who meticulously writes test cases for potential bugs on websites"
                "Based on all the elements available on the screen, write the description of all the test cases that you can think of"
                "Do not change the URL of the page, and do not navigate away from the current page you are on"
                """
                Adhere strictly to the ActionAnalyzerResponse pydantic model for your response, which **MUST** be in JSON:

                class ActionAnalyzerResponse(Model):
                    page_url: str
                    interactions: list[InteractionToTest]

                here is the supplementary pydantic model:
                class InteractionToTest(Model):
                    interaction_to_test: str
                    instructions_for_test: str
                    expected_result: str
                """
            )

            print(result)

            json_data = self.extract_json_from_response(result)

            if not json_data:
                return ActionAnalyzerResponse(page_url="", interactions=[])

            formatted_response = {}
            formatted_response["page_url"] = json_data["page_url"]
            formatted_response["interactions"] = []

            for interaction in json_data["interactions"]:
                formatted_interaction = {
                    "interaction_description": f"""{interaction["interaction_to_test"]}: {interaction["instructions_for_test"]}""",
                    "expected_result": interaction["expected_result"],
                }
                formatted_response["interactions"].append(formatted_interaction)

            return ActionAnalyzerResponse(**formatted_response)


if __name__ == "__main__":
    action_analyzer = ActionAnalyzer()
    import asyncio

    asyncio.run(action_analyzer.run_async())
