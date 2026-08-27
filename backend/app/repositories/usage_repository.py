from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.usage import UsageLog

class UsageRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def log_usage(self, user_id: str, model: str, input_tokens: int, output_tokens: int) -> UsageLog:
        log = UsageLog(
            user_id=user_id,
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens
        )
        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(log)
        return log

    async def total_tokens_used(self) -> int:
        result = await self.db.execute(
            select(func.sum(UsageLog.input_tokens + UsageLog.output_tokens))
        )
        return result.scalar() or 0

    async def total_requests(self) -> int:
        result = await self.db.execute(select(func.count(UsageLog.id)))
        return result.scalar() or 0

    async def list_by_user(self, user_id: str, limit: int = 50) -> List[UsageLog]:
        result = await self.db.execute(
            select(UsageLog)
            .where(UsageLog.user_id == user_id)
            .order_by(UsageLog.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
