from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.file import FileResponse, FileAnalyzeRequest, FileAnalyzeResponse
from app.services.auth_service import get_current_user
from app.services.file_service import FileService
from app.repositories.file_repository import FileRepository
from app.models.user import User
from app.core.exceptions import EntityNotFoundException, BadRequestException
from app.ai.registry import ai_registry

router = APIRouter(prefix="/files", tags=["Files & Documents"])

@router.post("/upload", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload and process document (PDF, DOCX, TXT, CSV, JSON, Image)."""
    service = FileService(db)
    file_record = await service.save_and_process_file(current_user.id, file)
    return FileResponse.model_validate(file_record)

@router.get("", response_model=List[FileResponse])
async def list_files(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all uploaded files for current user."""
    repo = FileRepository(db)
    files = await repo.list_by_user(current_user.id)
    return [FileResponse.model_validate(f) for f in files]

@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete uploaded document."""
    repo = FileRepository(db)
    file_obj = await repo.get_by_id(file_id, current_user.id)
    if not file_obj:
        raise EntityNotFoundException("File not found")
    await repo.delete(file_obj)
    return None

@router.post("/analyze", response_model=FileAnalyzeResponse)
async def analyze_file(
    req: FileAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Analyze document (Summary, Key Points, Q&A, Translation)."""
    repo = FileRepository(db)
    file_obj = await repo.get_by_id(req.file_id, current_user.id)
    if not file_obj:
        raise EntityNotFoundException("File not found")
    if not file_obj.extracted_text:
        raise BadRequestException("No text content available in this file for analysis.")

    mode = req.mode or "summary"
    prompt_map = {
        "summary": "Ushbu hujjatning to'liq va aniq xulosasini (summary) taqdim eting.",
        "key_points": "Ushbu hujjatdagi eng muhim asosiy bandlar va xulosalarni ro'yxat shaklida ajratib bering.",
        "qa": f"Hujjat asosida quyidagi savolga to'liq javob bering: {req.question}",
        "translate": "Ushbu hujjat mazmunini o'zbek tiliga tushunarli qilib tarjima va tahlil qiling."
    }
    
    instruction = prompt_map.get(mode, "Hujjatni tahlil qiling.")
    provider = ai_registry.get_provider_for_model(current_user.default_model or "gpt-4o-mini")

    sample_text = file_obj.extracted_text[:12000] # Fit in context
    messages = [
        {"role": "user", "content": f"Hujjat matni:\n{sample_text}\n\nVazifa:\n{instruction}"}
    ]

    res = await provider.chat(messages, model=current_user.default_model or "gpt-4o-mini")
    return FileAnalyzeResponse(
        file_id=file_obj.id,
        file_name=file_obj.file_name,
        mode=mode,
        result=res["content"]
    )
