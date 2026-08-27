from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.token import Token, RefreshTokenRequest
from app.services.auth_service import AuthService, get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    auth_service = AuthService(db)
    user, token = await auth_service.register(user_in)
    return {
        "user": UserResponse.model_validate(user),
        "tokens": token
    }

@router.post("/login", response_model=dict)
async def login(login_in: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate and obtain JWT access & refresh tokens."""
    auth_service = AuthService(db)
    user, token = await auth_service.authenticate(login_in)
    return {
        "user": UserResponse.model_validate(user),
        "tokens": token
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(req: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Refresh access token using refresh token."""
    auth_service = AuthService(db)
    return await auth_service.refresh_token(req.refresh_token)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get authenticated user profile."""
    return UserResponse.model_validate(current_user)
