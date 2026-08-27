from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from pathlib import Path

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="allow")

    # App
    APP_NAME: str = "WEN AI"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    
    # Security
    JWT_SECRET_KEY: str = "wen_ai_super_secret_jwt_key_change_in_production_2026_x99!"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day for dev
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./wen_ai.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Rate Limiting
    RATE_LIMIT_FREE_TIER: int = 60
    
    # AI Providers
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    
    GEMINI_API_KEY: Optional[str] = None
    
    ANTHROPIC_API_KEY: Optional[str] = None
    
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    
    # Qdrant / Vector
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: Optional[str] = None
    
    # Storage
    MAX_FILE_SIZE_MB: int = 25
    UPLOAD_DIR: str = str(Path(__file__).parent.parent.parent / "uploads")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:80",
        "http://localhost",
    ]

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
