from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.file import FileAttachment

class FileRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: str, file_name: str, file_type: str, file_size: int, file_path: str, extracted_text: Optional[str] = None, summary: Optional[str] = None) -> FileAttachment:
        f = FileAttachment(
            user_id=user_id,
            file_name=file_name,
            file_type=file_type,
            file_size=file_size,
            file_path=file_path,
            extracted_text=extracted_text,
            summary=summary
        )
        self.db.add(f)
        await self.db.commit()
        await self.db.refresh(f)
        return f

    async def get_by_id(self, file_id: str, user_id: Optional[str] = None) -> Optional[FileAttachment]:
        query = select(FileAttachment).where(FileAttachment.id == file_id)
        if user_id:
            query = query.where(FileAttachment.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: str) -> List[FileAttachment]:
        result = await self.db.execute(
            select(FileAttachment)
            .where(FileAttachment.user_id == user_id)
            .order_by(FileAttachment.created_at.desc())
        )
        return list(result.scalars().all())

    async def delete(self, file_obj: FileAttachment) -> None:
        await self.db.delete(file_obj)
        await self.db.commit()

    async def count_all(self) -> int:
        result = await self.db.execute(select(func.count(FileAttachment.id)))
        return result.scalar() or 0
