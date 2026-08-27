from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class PromptBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = None
    content: str = Field(..., min_length=5)
    category: Optional[str] = "custom"

class PromptCreate(PromptBase):
    pass

class PromptUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None

class PromptResponse(PromptBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
