from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.message import Message


class MessageRepository:
    def list_for_conversation(
        self,
        session: Session,
        conversation_id: str,
    ) -> list[Message]:
        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        return list(session.scalars(statement).all())

    def create(
        self,
        session: Session,
        *,
        conversation_id: str,
        role: str,
        content: str,
        provider: str | None = None,
        model: str | None = None,
    ) -> Message:
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            provider=provider,
            model=model,
        )
        session.add(message)
        session.flush()
        session.refresh(message)
        return message