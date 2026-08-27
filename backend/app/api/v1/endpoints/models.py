from fastapi import APIRouter
from app.schemas.admin import ModelsListResponse
from app.ai.registry import ai_registry

router = APIRouter(prefix="/models", tags=["Models"])

@router.get("", response_model=ModelsListResponse)
async def list_models():
    """Retrieve list of all available AI models across providers."""
    models = ai_registry.get_all_models()
    return ModelsListResponse(
        models=models,
        default_model="gpt-4o-mini"
    )
