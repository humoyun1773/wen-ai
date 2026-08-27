from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class ConversationBase(BaseModel):
    title: Optional[str] = "New Chat"
    model: Optional[str] = "gpt-4o-mini"
    system_prompt: Optional[str] = None

class ConversationCreate(ConversationBase):
    pass

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    model: Optional[str] = None
    system_prompt: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_archived: Optional[bool] = None

class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    model: str
    system_prompt: Optional[str] = None
    is_pinned: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime

class ConversationDetailResponse(ConversationResponse):
    messages_count: Optional[int] = 0
