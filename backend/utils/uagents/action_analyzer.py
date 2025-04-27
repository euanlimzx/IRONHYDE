from .base_agent import BaseAgent
from uagents import Model, Context
from dotenv import load_dotenv, find_dotenv
import os
from langchain_openai import ChatOpenAI


load_dotenv(find_dotenv())


class ActionAnalyzerRequest(Model):
    interaction: str
    response_observed: str


class ActionAnalyzerResponse(Model):
    response: str


class UserJugdgementAgent(BaseAgent):
    def __init__(
        self,
        name: str = "user_judgement_agent",
        seed: str = "user_judgement_seed",
        port_number: int = 8001,
    ):
        super().__init__(
            name=name,
            seed=seed,
            port_number=port_number,
        )

        self.initialize_llm()

        @self.agent.on_rest_post(
            f"/agent/{name}", ActionAnalyzerRequest, ActionAnalyzerResponse
        )
        async def handle_post_request(
            ctx: Context, req: ActionAnalyzerRequest
        ) -> ActionAnalyzerResponse:

            prompt = f"""
                You are simulating a web user performing an action on a website.

                Interaction Prompt:
                {req.interaction}

                Response Observed:
                {req.response_observed}

                Using common sense and general web behavior, decide if the response seems expected or not. If something seems broken, missing, or strange, mark it as an error.

                Return JSON like:
                {{
                "interaction": "...",
                "response_observed": "...",
                "error": true or false
                }}
                Strictly return only valid JSON. Do not add commentary.
            """

            return self.llm.ainvoke(prompt).strip()

    def initialize_llm(self):
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            print("❌ OPENAI_API_KEY not found in environment.")
            raise ValueError

        self.llm = ChatOpenAI(model="gpt-4o", openai_api_key=key)
