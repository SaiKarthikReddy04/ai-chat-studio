from fastapi import APIRouter

from app.core.config import settings
from app.schemas.model import ModelOption


router = APIRouter(prefix="/models", tags=["models"])


@router.get("", response_model=list[ModelOption])
def list_models() -> list[ModelOption]:
    return [
        ModelOption(
            id=settings.gemini_model,
            name="Gemini 3.6 Flash",
            provider="gemini",
            availability=(
                "available" if settings.gemini_api_key else "not-configured"
            ),
        ),
        ModelOption(
            id=settings.openai_model,
            name="GPT-6 Luna",
            provider="openai",
            availability=(
                "available" if settings.openai_api_key else "not-configured"
            ),
        ),
        ModelOption(
            id=settings.anthropic_model,
            name="Claude Sonnet 5.5",
            provider="anthropic",
            availability=(
                "available" if settings.anthropic_api_key else "not-configured"
            ),
        ),
        ModelOption(
            id=settings.nvidia_model,
            name="Nemotron 3.5 Lightning",
            provider="nvidia",
            availability=(
                "available" if settings.nvidia_api_key else "not-configured"
            ),
        ),
        ModelOption(
            id=settings.openrouter_model,
            name="OpenRouter Free Router",
            provider="openrouter",
            availability=(
                "available" if settings.openrouter_api_key else "not-configured"
            ),
        ),
    ]