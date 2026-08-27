from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, delete
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserAdminUpdate

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email.lower()))
        return result.scalar_one_or_none()

    async def create(self, user_in: UserCreate, hashed_password: str, role: str = "user") -> User:
        user = User(
            name=user_in.name,
            email=user_in.email.lower(),
            password_hash=hashed_password,
            role=role,
            is_active=True
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update(self, user: User, update_data: UserUpdate) -> User:
        data = update_data.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(user, field, value)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update_password(self, user: User, new_hashed_password: str) -> User:
        user.password_hash = new_hashed_password
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def admin_update(self, user: User, update_data: UserAdminUpdate) -> User:
        data = update_data.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(user, field, value)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def list_all(self, skip: int = 0, limit: int = 50, search: Optional[str] = None) -> List[User]:
        query = select(User).order_by(User.created_at.desc())
        if search:
            query = query.where(User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_all(self) -> int:
        result = await self.db.execute(select(func.count(User.id)))
        return result.scalar() or 0

    async def count_active(self) -> int:
        result = await self.db.execute(select(func.count(User.id)).where(User.is_active == True))
        return result.scalar() or 0

    async def delete(self, user: User) -> None:
        await self.db.delete(user)
        await self.db.commit()
