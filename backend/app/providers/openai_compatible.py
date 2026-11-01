import httpx


class OpenAICompatibleProvider:
    def __init__(
        self,
        *,
        api_key: str,
        base_url: str,
        provider_name: str,
    ) -> None:
        if not api_key:
            raise ValueError(f"{provider_name} API key is not configured.")

        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.provider_name = provider_name

    async def generate(self, prompt: str, model: str) -> str:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            response.raise_for_status()
            data = response.json()

        try:
            answer = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as error:
            raise RuntimeError(
                f"{self.provider_name} returned an unexpected response."
            ) from error

        if not isinstance(answer, str) or not answer.strip():
            raise RuntimeError(f"{self.provider_name} returned an empty response.")

        return answer.strip()