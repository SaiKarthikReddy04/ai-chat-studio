from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_session
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.schemas.message import MessageCreate, MessageRead
from app.services.message_service import message_service


router = APIRouter(prefix="/conversations", tags=["messages"])
conversation_repository = ConversationRepository()
message_repository = MessageRepository()


@router.get(
    "/{conversation_id}/messages",
    response_model=list[MessageRead],
)
def list_messages(
    conversation_id: str,
    session: Session = Depends(get_session),
):
    conversation = conversation_repository.get_by_id(session, conversation_id)
    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    return message_repository.list_for_conversation(session, conversation_id)


@router.post(
    "/{conversation_id}/messages",
    response_model=MessageRead,
    status_code=status.HTTP_201_CREATED,
)
async def send_message(
    conversation_id: str,
    request: MessageCreate,
    session: Session = Depends(get_session),
):
    result = await message_service.send_message(
        session,
        conversation_id,
        request,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    _, assistant_message = result
    return assistant_message