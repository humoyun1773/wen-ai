from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.prompt import PromptCreate, PromptUpdate, PromptResponse
from app.services.auth_service import get_current_user
from app.repositories.prompt_repository import PromptRepository
from app.models.user import User
from app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/prompts", tags=["System Prompts"])

@router.get("", response_model=List[PromptResponse])
async def list_prompts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List system prompt templates for current user."""
    repo = PromptRepository(db)
    prompts = await repo.list_by_user(current_user.id)
    return [PromptResponse.model_validate(p) for p in prompts]

@router.post("", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
async def create_prompt(
    prompt_in: PromptCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create custom persona or system prompt."""
    repo = PromptRepository(db)
    p = await repo.create(current_user.id, prompt_in)
    return PromptResponse.model_validate(p)

@router.patch("/{prompt_id}", response_model=PromptResponse)
async def update_prompt(
    prompt_id: str,
    prompt_in: PromptUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update custom prompt template."""
    repo = PromptRepository(db)
    p = await repo.get_by_id(prompt_id, current_user.id)
    if not p:
        raise EntityNotFoundException("Prompt not found")
    updated = await repo.update(p, prompt_in)
    return PromptResponse.model_validate(updated)

@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prompt(
    prompt_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a prompt template."""
    repo = PromptRepository(db)
    p = await repo.get_by_id(prompt_id, current_user.id)
    if not p:
        raise EntityNotFoundException("Prompt not found")
    await repo.delete(p)
    return None
