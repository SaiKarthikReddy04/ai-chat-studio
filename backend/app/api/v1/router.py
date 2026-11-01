from fastapi import APIRouter

from app.api.v1.endpoints.conversations import router as conversations_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.messages import router as messages_router


api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(conversations_router)
api_router.include_router(messages_router)