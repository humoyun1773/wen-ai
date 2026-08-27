from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.admin import AdminStatsResponse, ProviderStatus
from app.schemas.user import UserResponse, UserAdminUpdate
from app.services.auth_service import get_current_admin_user
from app.services.admin_service import AdminService
from app.repositories.user_repository import UserRepository
from app.models.user import User
from app.core.exceptions import EntityNotFoundException

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/stats", response_model=AdminStatsResponse)
async def get_system_stats(
    admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve global analytics and metrics."""
    service = AdminService(db)
    return await service.get_dashboard_stats()

@router.get("/providers", response_model=List[ProviderStatus])
async def get_providers_status(
    admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Diagnostic overview of AI Providers and API Key health."""
    service = AdminService(db)
    return service.get_providers_health()

@router.get("/users", response_model=List[UserResponse])
async def list_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """List all registered users with search and pagination."""
    repo = UserRepository(db)
    users = await repo.list_all(skip=skip, limit=limit, search=search)
    return [UserResponse.model_validate(u) for u in users]

@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user_status(
    user_id: str,
    update_in: UserAdminUpdate,
    admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Admin update for user status (block/unblock) or role (user/admin)."""
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise EntityNotFoundException("User not found")
    
    updated = await repo.admin_update(user, update_in)
    return UserResponse.model_validate(updated)

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a user account."""
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise EntityNotFoundException("User not found")
    await repo.delete(user)
    return None
