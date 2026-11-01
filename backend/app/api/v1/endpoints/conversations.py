from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_session
from app.schemas.conversation import (
    ConversationCreate,
    ConversationRead,
    ConversationUpdate,
)
from app.services.conversation_service import ConversationService

router = APIRouter(prefix="/conversations", tags=["conversations"])
service = ConversationService()


@router.get("", response_model=list[ConversationRead])
def list_conversations(
    session: Session = Depends(get_session),
) -> list[ConversationRead]:
    return service.list_conversations(session)


@router.post(
    "",
    response_model=ConversationRead,
    status_code=status.HTTP_201_CREATED,
)
def create_conversation(
    payload: ConversationCreate,
    session: Session = Depends(get_session),
) -> ConversationRead:
    return service.create_conversation(session, payload.title)


@router.get("/{conversation_id}", response_model=ConversationRead)
def get_conversation(
    conversation_id: str,
    session: Session = Depends(get_session),
) -> ConversationRead:
    conversation = service.get_conversation(session, conversation_id)
    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )
    return conversation


@router.patch("/{conversation_id}", response_model=ConversationRead)
def rename_conversation(
    conversation_id: str,
    payload: ConversationUpdate,
    session: Session = Depends(get_session),
) -> ConversationRead:
    conversation = service.rename_conversation(
        session,
        conversation_id,
        payload.title,
    )
    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )
    return conversation


@router.delete(
    "/{conversation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_conversation(
    conversation_id: str,
    session: Session = Depends(get_session),
) -> None:
    deleted = service.delete_conversation(session, conversation_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )