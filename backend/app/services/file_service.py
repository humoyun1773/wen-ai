import os
import uuid
import json
import csv
import io
from pathlib import Path
from typing import Optional, Tuple
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.exceptions import BadRequestException
from app.models.file import FileAttachment
from app.repositories.file_repository import FileRepository
from app.core.logging_config import logger

try:
    import pypdf
except ImportError:
    pypdf = None

try:
    import docx
except ImportError:
    docx = None

class FileService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.file_repo = FileRepository(db)

    async def save_and_process_file(self, user_id: str, upload_file: UploadFile) -> FileAttachment:
        filename = upload_file.filename or "uploaded_file"
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        
        # Read file content
        content = await upload_file.read()
        file_size = len(content)

        # Check size limit
        if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            raise BadRequestException(f"File size exceeds maximum {settings.MAX_FILE_SIZE_MB}MB limit")

        # Save to disk
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as f:
            f.write(content)

        # Extract text based on file format
        extracted_text = self._extract_text(content, ext)
        summary = self._generate_brief_summary(extracted_text) if extracted_text else None

        # Store in database
        file_record = await self.file_repo.create(
            user_id=user_id,
            file_name=filename,
            file_type=ext,
            file_size=file_size,
            file_path=file_path,
            extracted_text=extracted_text,
            summary=summary
        )
        return file_record

    def _extract_text(self, content: bytes, ext: str) -> str:
        """Extract plain text from various file formats."""
        try:
            if ext in ["txt", "md", "py", "js", "ts", "json", "html", "css"]:
                return content.decode("utf-8", errors="ignore")

            elif ext == "pdf":
                if pypdf:
                    pdf_reader = pypdf.PdfReader(io.BytesIO(content))
                    text_parts = []
                    for page in pdf_reader.pages:
                        extracted = page.extract_text()
                        if extracted:
                            text_parts.append(extracted)
                    return "\n\n".join(text_parts)
                return "PDF parser library not installed."

            elif ext in ["docx", "doc"]:
                if docx:
                    doc = docx.Document(io.BytesIO(content))
                    return "\n".join([p.text for p in doc.paragraphs if p.text])
                return "DOCX parser library not installed."

            elif ext == "csv":
                text_stream = io.StringIO(content.decode("utf-8", errors="ignore"))
                reader = csv.reader(text_stream)
                lines = [", ".join(row) for row in reader]
                return "\n".join(lines[:500])  # limit to top 500 lines

            elif ext in ["png", "jpg", "jpeg", "webp"]:
                return f"[Image Attachment: {ext.upper()} image file processed for vision analysis]"

            else:
                # Attempt general decode
                return content.decode("utf-8", errors="ignore")
        except Exception as e:
            logger.error(f"Error extracting text from file: {e}")
            return ""

    def _generate_brief_summary(self, text: str) -> str:
        """Quick extractive summary for instant preview."""
        cleaned = " ".join(text.split())
        if len(cleaned) <= 300:
            return cleaned
        return cleaned[:300] + "..."
