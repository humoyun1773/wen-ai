from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    total_conversations: int
    total_messages: int
    total_files: int
    total_tokens_used: int
    total_requests: int

class ProviderStatus(BaseModel):
    provider_name: str
    is_configured: bool
    masked_key: Optional[str] = None
    default_model: str
    available_models: List[str]
    status: str  # "active" | "no_api_key" | "degraded"

class ModelInfo(BaseModel):
    id: str
    name: str
    provider: str
    context_window: int
    description: str
    is_available: bool

class ModelsListResponse(BaseModel):
    models: List[ModelInfo]
    default_model: str
