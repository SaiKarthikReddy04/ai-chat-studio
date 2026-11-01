from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db.models.conversation import Conversation
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.schemas.message import MessageCreate
from app.providers.factory import get_provider

class MessageService:
    def __init__(self) -> None:
        self.conversations = ConversationRepository()
        self.messages = MessageRepository()

    async def send_message(
        self,
        session: Session,
        conversation_id: str,
        request: MessageCreate,
    ):
        conversation = self.conversations.get_by_id(session, conversation_id)
        if conversation is None:
            return None

        user_message = self.messages.create(
            session,
            conversation_id=conversation_id,
            role="user",
            content=request.content,
            provider=request.provider,
            model=request.model,
        )
        session.commit()

        history = self.messages.list_for_conversation(session, conversation_id)
        prompt = "\n".join(
            f"{'User' if message.role == 'user' else 'Assistant'}: {message.content}"
            for message in history
        )

        provider = get_provider(request.provider)
        answer = await provider.generate(prompt, request.model)

        assistant_message = self.messages.create(
            session,
            conversation_id=conversation_id,
            role="assistant",
            content=answer,
            provider=request.provider,
            model=request.model,
        )

        conversation.updated_at = datetime.now(timezone.utc)
        session.commit()

        return user_message, assistant_message


message_service = MessageService()