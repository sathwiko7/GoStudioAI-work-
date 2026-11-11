import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.api.auth import get_current_user
from backend.models.db_models import User, Generation, GeneratedMedia, UsageAnalytics
from backend.models.schemas import GenerateImageRequest
from backend.services.generation_service import generate_creative_image
from backend.services.llm_service import understand_user_prompt

router = APIRouter(prefix="/generate", tags=["AI Image Generation"])

@router.post("")
async def create_generation(
    req: GenerateImageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Module 4: Text-to-Image Generation with aspect ratios, styles, and prompt enhancement.
    """
    prompt = req.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
        
    # Auto-enhance prompt if not supplied
    enhanced = req.enhanced_prompt
    if not enhanced:
        plan = await understand_user_prompt(prompt)
        enhanced = plan.enhanced_prompt
        
    img_path, latency, cost = await generate_creative_image(
        prompt=enhanced,
        aspect_ratio=req.aspect_ratio,
        model_id=req.model_id,
        style=req.style,
        seed=req.seed
    )
    
    media_url = f"/static/generated/{img_path.name}"
    gen_id = str(uuid.uuid4())
    
    # Save Generation Record
    gen = Generation(
        generation_id=gen_id,
        user_id=current_user.user_id,
        project_id=req.project_id,
        prompt=prompt,
        enhanced_prompt=enhanced,
        task_type="image_generation",
        model_id=req.model_id,
        status="completed",
        latency=latency,
        cost=cost,
        aspect_ratio=req.aspect_ratio,
        style=req.style
    )
    db.add(gen)
    
    # Save Generated Media
    media = GeneratedMedia(
        generation_id=gen_id,
        media_url=media_url,
        media_type="image/jpeg",
        file_size_kb=round(img_path.stat().st_size / 1024, 1)
    )
    db.add(media)
    
    # Record Usage Analytics
    analytics = UsageAnalytics(
        user_id=current_user.user_id,
        model_id=req.model_id,
        task_type="image_generation",
        processing_time=latency,
        estimated_cost=cost,
        status="completed"
    )
    db.add(analytics)
    db.commit()
    
    return {
        "generation_id": gen_id,
        "media_url": media_url,
        "prompt": prompt,
        "enhanced_prompt": enhanced,
        "model_id": req.model_id,
        "aspect_ratio": req.aspect_ratio,
        "latency": latency,
        "cost": cost,
        "created_at": str(gen.created_at)
    }
