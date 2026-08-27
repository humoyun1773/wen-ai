from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class FileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    file_name: str
    file_type: str
    file_size: int
    summary: Optional[str] = None
    created_at: datetime

class FileAnalyzeRequest(BaseModel):
    file_id: str
    question: Optional[str] = None
    mode: Optional[str] = "summary"  # summary | key_points | qa | translate

class FileAnalyzeResponse(BaseModel):
    file_id: str
    file_name: str
    mode: str
    result: str
