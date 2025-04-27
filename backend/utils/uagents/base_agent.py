from uagents import Agent, Context
import time


class BaseAgent:
    def __init__(
        self,
        name: str,
        seed: str,
        port_number: int,
    ):
        self.name = name

        # 1. Create the agent instance
        self.agent = Agent(
            name=name,
            seed=seed,
            port=port_number,
            endpoint=[f"http://127.0.0.1:{port_number}/submit"],
        )

        # Register the default startup handler
        @self.agent.on_event("startup")
        async def startup_function(ctx: Context):
            ctx.logger.info(
                f"Hello, I'm agent {self.name} and my address is {self.agent.address}."
            )

        @self.agent.on_rest_get(f"/agent/{name}", self.response_model)
        async def handle_get(ctx: Context) -> dict[str, any]:
            ctx.logger.info("Received GET request")
            return {
                "timestamp": int(time.time()),
                "text": "Hello from the GET handler!",
                "agent_address": ctx.agent.address,
            }

    def register_startup_handler(self, handler_func):
        """Override the default startup handler with a custom one"""
        self.agent.on_event("startup")(handler_func)

    def register_message_handler(self, message_model, handler_func):
        """Register a message handler for a specific model"""
        self.agent.on_message(message_model)(handler_func)

    def register_event_handler(self, event_name, handler_func):
        """Register a custom event handler"""
        self.agent.on_event(event_name)(handler_func)

    def run(self):
        """Run the agent"""
        self.agent.run()


# Example usage:
if __name__ == "__main__":
    # Create an agent
    alice = BaseAgent(name="alice", seed="secret_seed_phrase")

    # Run the agent
    alice.run()
