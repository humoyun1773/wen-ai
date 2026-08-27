from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.conversation import ConversationCreate, ConversationUpdate, ConversationResponse
from app.services.auth_service import get_current_user
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.models.user import User
from app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/conversations", tags=["Conversations"])

@router.get("", response_model=List[ConversationResponse])
async def list_conversations(
    search: Optional[str] = Query(None),
    archived: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all conversations for authenticated user."""
    repo = ConversationRepository(db)
    convs = await repo.list_by_user(current_user.id, search=search, archived=archived)
    return [ConversationResponse.model_validate(c) for c in convs]

@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conv_in: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new conversation session."""
    repo = ConversationRepository(db)
    conv = await repo.create(current_user.id, conv_in)
    return ConversationResponse.model_validate(conv)

@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get single conversation by ID."""
    repo = ConversationRepository(db)
    conv = await repo.get_by_id(conversation_id, current_user.id)
    if not conv:
        raise EntityNotFoundException("Conversation not found")
    return ConversationResponse.model_validate(conv)

@router.patch("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: str,
    conv_in: ConversationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update conversation title, model, pin status, or archive."""
    repo = ConversationRepository(db)
    conv = await repo.get_by_id(conversation_id, current_user.id)
    if not conv:
        raise EntityNotFoundException("Conversation not found")
    updated = await repo.update(conv, conv_in)
    return ConversationResponse.model_validate(updated)

@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a conversation."""
    repo = ConversationRepository(db)
    conv = await repo.get_by_id(conversation_id, current_user.id)
    if not conv:
        raise EntityNotFoundException("Conversation not found")
    await repo.delete(conv)
    return None

@router.post("/{conversation_id}/clear", status_code=status.HTTP_200_OK)
async def clear_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Clear all messages inside a conversation."""
    conv_repo = ConversationRepository(db)
    conv = await conv_repo.get_by_id(conversation_id, current_user.id)
    if not conv:
        raise EntityNotFoundException("Conversation not found")
    
    msg_repo = MessageRepository(db)
    await msg_repo.delete_by_conversation(conversation_id)
    return {"message": "All messages in conversation cleared"}
