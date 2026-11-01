from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class MessageCreate(BaseModel):
    content: str = Field(
        min_length=1,
        max_length=12_000,
    )
    model: str = Field(
        default="gemini-3.6-flash",
        min_length=1,
        max_length=100,
    )


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str
    role: Literal["user", "assistant"]
    content: str
    provider: str | None
    model: str | None
    created_at: datetime