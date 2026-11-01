from typing import Literal

from pydantic import BaseModel

from app.schemas.message import ProviderId


class ModelOption(BaseModel):
    id: str
    name: str
    provider: ProviderId
    availability: Literal["available", "not-configured"]