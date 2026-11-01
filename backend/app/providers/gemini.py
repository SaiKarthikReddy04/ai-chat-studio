from google import genai

from app.core.config import settings


class GeminiProvider:
    async def generate(self, prompt: str) -> str:
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is not configured.")

        client = genai.Client(api_key=settings.gemini_api_key).aio

        try:
            response = await client.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
            )
            answer = response.text

            if not answer:
                raise RuntimeError("Gemini returned an empty response.")

            return answer
        finally:
            await client.aclose()