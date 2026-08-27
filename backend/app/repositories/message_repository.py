from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from app.models.message import Message
from app.schemas.message import MessageCreate

class MessageRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, msg_in: MessageCreate, tokens: int = 0) -> Message:
        message = Message(
            conversation_id=msg_in.conversation_id,
            role=msg_in.role,
            content=msg_in.content,
            tokens=tokens,
            metadata_json=msg_in.metadata_json
        )
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        return message

    async def list_by_conversation(self, conversation_id: str) -> List[Message]:
        result = await self.db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, message_id: str) -> Optional[Message]:
        result = await self.db.execute(select(Message).where(Message.id == message_id))
        return result.scalar_one_or_none()

    async def delete_by_conversation(self, conversation_id: str) -> None:
        await self.db.execute(
            delete(Message).where(Message.conversation_id == conversation_id)
        )
        await self.db.commit()

    async def delete(self, message: Message) -> None:
        await self.db.delete(message)
        await self.db.commit()

    async def count_all(self) -> int:
        result = await self.db.execute(select(func.count(Message.id)))
        return result.scalar() or 0
