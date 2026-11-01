from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "AI Chat Studio"
    app_env: str = "local"
    api_v1_prefix: str = "/api/v1"

    gemini_api_key: str | None = None
    gemini_model: str = "gemini-3.6-flash"
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-3.6-flash"

    openai_api_key: str | None = None
    openai_model: str = "gpt-6-luna"

    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-sonnet-5-5"

    nvidia_api_key: str | None = None
    nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"
    nvidia_model: str = "nvidia/nemotron-3.5-lightning-30b-a3b"

    openrouter_api_key: str | None = None
    openrouter_model: str = "openrouter/free"

    database_url: str = "sqlite:///./data/aichat.db"
    cors_origins: list[str] = ["http://localhost:5173" ,"http://localhost:5174"]


settings = Settings()