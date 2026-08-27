from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.message import ChatStreamRequest
from app.services.auth_service import get_current_user
from app.services.chat_service import ChatService
from app.models.user import User

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/stream")
async def chat_stream(
    request: ChatStreamRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Stream AI responses in real-time via Server-Sent Events (SSE).
    Supports multi-provider LLMs, Document attachments & RAG context injection.
    """
    chat_service = ChatService(db)
    event_generator = chat_service.stream_chat(current_user, request)

    return StreamingResponse(
        event_generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
