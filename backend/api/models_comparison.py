import asyncio
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.core.config import settings
from backend.api.auth import get_current_user
from backend.models.db_models import User
from backend.models.schemas import ModelCompareRequest, ModelCompareResponse, ModelCompareItem
from backend.services.generation_service import generate_creative_image

router = APIRouter(prefix="/models", tags=["Model Selection & Comparison"])

@router.get("")
def list_models():
    """Module 6: Model registry containing each model's supported tasks, cost, and speed"""
    return {"models": settings.AVAILABLE_MODELS}

@router.post("/compare", response_model=ModelCompareResponse)
async def compare_models(
    req: ModelCompareRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Module 6: Multi-Model Side-by-Side Comparison Arena.
    Dispatches generation requests concurrently across selected AI models.
    """
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required")
        
    models_to_test = req.model_ids[:3] # Up to 3 models concurrently
    model_meta = {m["model_id"]: m for m in settings.AVAILABLE_MODELS}
    
    tasks = []
    for mid in models_to_test:
        tasks.append(generate_creative_image(
            prompt=req.prompt,
            aspect_ratio=req.aspect_ratio,
            model_id=mid,
            style=req.style
        ))
        
    results = await asyncio.gather(*tasks)
    
    comparison_items = []
    for mid, (path, latency, cost) in zip(models_to_test, results):
        meta = model_meta.get(mid, {})
        comparison_items.append(ModelCompareItem(
            model_id=mid,
            model_name=meta.get("model_name", mid),
            provider=meta.get("provider", "Unknown"),
            media_url=f"/static/generated/{path.name}",
            latency=latency,
            estimated_cost=cost,
            quality_score=meta.get("quality_score", 9.4),
            badge=meta.get("badge", "Recommended")
        ))
        
    return ModelCompareResponse(
        prompt=req.prompt,
        results=comparison_items
    )
