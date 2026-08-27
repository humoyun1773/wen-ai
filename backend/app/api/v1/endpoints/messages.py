from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.message import MessageResponse, MessageCreate
from app.services.auth_service import get_current_user
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.models.user import User
from app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/conversations/{conversation_id}/messages", tags=["Messages"])

@router.get("", response_model=List[MessageResponse])
async def list_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all messages in a conversation."""
    conv_repo = ConversationRepository(db)
    conv = await conv_repo.get_by_id(conversation_id, current_user.id)
    if not conv:
        raise EntityNotFoundException("Conversation not found")

    msg_repo = MessageRepository(db)
    msgs = await msg_repo.list_by_conversation(conversation_id)
    return [MessageResponse.model_validate(m) for m in msgs]

@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def post_message(
    conversation_id: str,
    msg_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Manually append a message to conversation."""
    conv_repo = ConversationRepository(db)
    conv = await conv_repo.get_by_id(conversation_id, current_user.id)
    if not conv:
        raise EntityNotFoundException("Conversation not found")

    msg_repo = MessageRepository(db)
    msg_in.conversation_id = conversation_id
    created = await msg_repo.create(msg_in)
    return MessageResponse.model_validate(created)
