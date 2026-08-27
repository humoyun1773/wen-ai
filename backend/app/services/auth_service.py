from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.database.session import get_db
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserLogin, UserUpdate, PasswordChange
from app.schemas.token import Token
from app.models.user import User
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.core.exceptions import UnauthorizedException, BadRequestException, EntityNotFoundException

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def register(self, user_in: UserCreate) -> Tuple[User, Token]:
        existing = await self.user_repo.get_by_email(user_in.email)
        if existing:
            raise BadRequestException("User with this email already exists")

        # First registered user can automatically be admin for convenience
        count = await self.user_repo.count_all()
        role = "admin" if count == 0 else "user"

        hashed_password = get_password_hash(user_in.password)
        user = await self.user_repo.create(user_in, hashed_password, role=role)

        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)

        token = Token(access_token=access_token, refresh_token=refresh_token)
        return user, token

    async def authenticate(self, login_in: UserLogin) -> Tuple[User, Token]:
        user = await self.user_repo.get_by_email(login_in.email)
        if not user:
            raise UnauthorizedException("Invalid email or password")
        if not verify_password(login_in.password, user.password_hash):
            raise UnauthorizedException("Invalid email or password")
        if not user.is_active:
            raise UnauthorizedException("Account is disabled. Please contact administrator.")

        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        token = Token(access_token=access_token, refresh_token=refresh_token)
        return user, token

    async def refresh_token(self, refresh_token_str: str) -> Token:
        payload = decode_token(refresh_token_str)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid or expired refresh token")
        
        user_id = payload.get("sub")
        user = await self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise UnauthorizedException("User not found or inactive")

        access_token = create_access_token(user.id)
        new_refresh = create_refresh_token(user.id)
        return Token(access_token=access_token, refresh_token=new_refresh)

    async def change_password(self, user: User, pwd_change: PasswordChange) -> None:
        if not verify_password(pwd_change.old_password, user.password_hash):
            raise BadRequestException("Current password is incorrect")
        new_hash = get_password_hash(pwd_change.new_password)
        await self.user_repo.update_password(user, new_hash)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Dependency to retrieve currently authenticated user from Bearer token."""
    payload = decode_token(token)
    if not payload:
        raise UnauthorizedException("Invalid token signature or expired")
    
    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Invalid token payload")

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise UnauthorizedException("User not found")
    if not user.is_active:
        raise UnauthorizedException("Account is suspended")
    
    return user

async def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Dependency to verify admin privileges."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required"
        )
    return current_user
