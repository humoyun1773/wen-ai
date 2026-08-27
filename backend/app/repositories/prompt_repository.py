from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.prompt import SystemPrompt
from app.schemas.prompt import PromptCreate, PromptUpdate

class PromptRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: str, prompt_in: PromptCreate) -> SystemPrompt:
        p = SystemPrompt(
            user_id=user_id,
            name=prompt_in.name,
            description=prompt_in.description,
            content=prompt_in.content,
            category=prompt_in.category or "custom"
        )
        self.db.add(p)
        await self.db.commit()
        await self.db.refresh(p)
        return p

    async def get_by_id(self, prompt_id: str, user_id: Optional[str] = None) -> Optional[SystemPrompt]:
        query = select(SystemPrompt).where(SystemPrompt.id == prompt_id)
        if user_id:
            query = query.where(SystemPrompt.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: str) -> List[SystemPrompt]:
        result = await self.db.execute(
            select(SystemPrompt)
            .where(SystemPrompt.user_id == user_id)
            .order_by(SystemPrompt.created_at.desc())
        )
        return list(result.scalars().all())

    async def update(self, prompt: SystemPrompt, prompt_in: PromptUpdate) -> SystemPrompt:
        data = prompt_in.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(prompt, key, value)
        await self.db.commit()
        await self.db.refresh(prompt)
        return prompt

    async def delete(self, prompt: SystemPrompt) -> None:
        await self.db.delete(prompt)
        await self.db.commit()
