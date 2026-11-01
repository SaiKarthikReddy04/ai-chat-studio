from sqlalchemy.orm import Session

from app.db.models import Conversation
from app.repositories.conversation_repository import ConversationRepository


class ConversationService:
    def __init__(
        self,
        repository: ConversationRepository | None = None,
    ) -> None:
        self.repository = repository or ConversationRepository()

    def list_conversations(self, session: Session) -> list[Conversation]:
        return self.repository.list_recent(session)

    def get_conversation(
        self,
        session: Session,
        conversation_id: str,
    ) -> Conversation | None:
        return self.repository.get_by_id(session, conversation_id)

    def create_conversation(
        self,
        session: Session,
        title: str,
    ) -> Conversation:
        with session.begin():
            conversation = self.repository.create(session, title)
        return conversation

    def rename_conversation(
        self,
        session: Session,
        conversation_id: str,
        title: str,
    ) -> Conversation | None:
        with session.begin():
            conversation = self.repository.get_by_id(session, conversation_id)
            if conversation is None:
                return None
            self.repository.rename(session, conversation, title)
        return conversation

    def delete_conversation(
        self,
        session: Session,
        conversation_id: str,
    ) -> bool:
        with session.begin():
            conversation = self.repository.get_by_id(session, conversation_id)
            if conversation is None:
                return False
            self.repository.delete(session, conversation)
        return True