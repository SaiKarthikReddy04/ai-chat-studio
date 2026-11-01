from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Conversation


class ConversationRepository:
    def list_recent(
        self,
        session: Session,
        limit: int = 50,
    ) -> list[Conversation]:
        statement = (
            select(Conversation)
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
        )
        return list(session.scalars(statement).all())

    def get_by_id(
        self,
        session: Session,
        conversation_id: str,
    ) -> Conversation | None:
        return session.get(Conversation, conversation_id)

    def create(
        self,
        session: Session,
        title: str,
    ) -> Conversation:
        conversation = Conversation(title=title)
        session.add(conversation)
        session.flush()
        session.refresh(conversation)
        return conversation

    def rename(
        self,
        session: Session,
        conversation: Conversation,
        title: str,
    ) -> Conversation:
        conversation.title = title
        session.flush()
        session.refresh(conversation)
        return conversation

    def delete(
        self,
        session: Session,
        conversation: Conversation,
    ) -> None:
        session.delete(conversation)
        session.flush()