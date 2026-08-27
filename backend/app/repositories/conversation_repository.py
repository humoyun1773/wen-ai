from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.models.conversation import Conversation
from app.schemas.conversation import ConversationCreate, ConversationUpdate

class ConversationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, conversation_id: str, user_id: str) -> Optional[Conversation]:
        result = await self.db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            )
        )
        return result.scalar_one_or_none()

    async def create(self, user_id: str, conv_in: ConversationCreate) -> Conversation:
        conv = Conversation(
            user_id=user_id,
            title=conv_in.title or "New Chat",
            model=conv_in.model or "gpt-4o-mini",
            system_prompt=conv_in.system_prompt
        )
        self.db.add(conv)
        await self.db.commit()
        await self.db.refresh(conv)
        return conv

    async def update(self, conversation: Conversation, conv_update: ConversationUpdate) -> Conversation:
        data = conv_update.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(conversation, key, value)
        await self.db.commit()
        await self.db.refresh(conversation)
        return conversation

    async def list_by_user(self, user_id: str, search: Optional[str] = None, archived: bool = False) -> List[Conversation]:
        query = select(Conversation).where(
            Conversation.user_id == user_id,
            Conversation.is_archived == archived
        ).order_by(Conversation.is_pinned.desc(), Conversation.updated_at.desc())
        
        if search:
            query = query.where(Conversation.title.ilike(f"%{search}%"))
        
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_all(self) -> int:
        result = await self.db.execute(select(func.count(Conversation.id)))
        return result.scalar() or 0

    async def delete(self, conversation: Conversation) -> None:
        await self.db.delete(conversation)
        await self.db.commit()

    async def delete_all_for_user(self, user_id: str) -> None:
        conversations = await self.list_by_user(user_id)
        for c in conversations:
            await self.db.delete(c)
        await self.db.commit()
