import httpx


class AnthropicProvider:
    def __init__(self, *, api_key: str) -> None:
        if not api_key:
            raise ValueError("Anthropic API key is not configured.")

        self.api_key = api_key

    async def generate(self, prompt: str, model: str) -> str:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "max_tokens": 1024,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            response.raise_for_status()
            data = response.json()

        text_blocks = [
            block["text"]
            for block in data.get("content", [])
            if block.get("type") == "text" and isinstance(block.get("text"), str)
        ]
        answer = "\n".join(text_blocks).strip()

        if not answer:
            raise RuntimeError("Anthropic returned an empty response.")

        return answer