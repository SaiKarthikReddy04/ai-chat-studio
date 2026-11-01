from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db.models.conversation import Conversation
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.schemas.message import MessageCreate
from app.providers.gemini import GeminiProvider


class MessageService:
    def __init__(self) -> None:
        self.conversations = ConversationRepository()
        self.messages = MessageRepository()
        self.gemini = GeminiProvider()

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
            provider="gemini",
            model=request.model,
        )
        session.commit()

        history = self.messages.list_for_conversation(session, conversation_id)
        prompt = "\n".join(
            f"{'User' if message.role == 'user' else 'Assistant'}: {message.content}"
            for message in history
        )

        answer = await self.gemini.generate(prompt)

        assistant_message = self.messages.create(
            session,
            conversation_id=conversation_id,
            role="assistant",
            content=answer,
            provider="gemini",
            model=request.model,
        )

        conversation.updated_at = datetime.now(timezone.utc)
        session.commit()

        return user_message, assistant_message


message_service = MessageService()