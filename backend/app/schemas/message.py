from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class MessageBase(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system|error)$")
    content: str = Field(..., min_length=1)

class MessageCreate(MessageBase):
    conversation_id: str
    metadata_json: Optional[str] = None

class MessageResponse(MessageBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str
    tokens: int
    metadata_json: Optional[str] = None
    created_at: datetime

class ChatStreamRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str = Field(..., min_length=1)
    model: Optional[str] = None
    system_prompt: Optional[str] = None
    temperature: Optional[float] = 0.7
    attached_file_ids: Optional[List[str]] = []
