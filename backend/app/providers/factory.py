from app.core.config import settings
from app.providers.anthropic import AnthropicProvider
from app.providers.gemini import GeminiProvider
from app.providers.openai_compatible import OpenAICompatibleProvider
from app.schemas.message import ProviderId


def get_provider(provider_id: ProviderId):
    if provider_id == "gemini":
        return GeminiProvider()

    if provider_id == "anthropic":
        return AnthropicProvider(api_key=settings.anthropic_api_key or "")

    if provider_id == "openai":
        return OpenAICompatibleProvider(
            api_key=settings.openai_api_key or "",
            base_url="https://api.openai.com/v1",
            provider_name="OpenAI",
        )

    if provider_id == "nvidia":
        return OpenAICompatibleProvider(
            api_key=settings.nvidia_api_key or "",
            base_url=settings.nvidia_base_url,
            provider_name="NVIDIA",
        )

    if provider_id == "openrouter":
        return OpenAICompatibleProvider(
            api_key=settings.openrouter_api_key or "",
            base_url="https://openrouter.ai/api/v1",
            provider_name="OpenRouter",
        )

    raise ValueError(f"Unsupported provider: {provider_id}")