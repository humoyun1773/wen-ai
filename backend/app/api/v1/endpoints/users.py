from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.user import UserResponse, UserUpdate, PasswordChange
from app.services.auth_service import AuthService, get_current_user
from app.repositories.user_repository import UserRepository
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user settings and info."""
    return UserResponse.model_validate(current_user)

@router.patch("/me", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update profile preferences (name, model, temperature)."""
    user_repo = UserRepository(db)
    updated = await user_repo.update(current_user, update_data)
    return UserResponse.model_validate(updated)

@router.post("/me/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    pwd_in: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Change current user password."""
    auth_service = AuthService(db)
    await auth_service.change_password(current_user, pwd_in)
    return {"message": "Password updated successfully"}
