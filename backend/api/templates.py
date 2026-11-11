from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.api.auth import get_current_user
from backend.models.db_models import User, Generation, GeneratedMedia, UsageAnalytics
from backend.models.schemas import UseTemplateRequest
from backend.services.templates_service import list_templates, render_from_template

router = APIRouter(prefix="/templates", tags=["Creative Templates"])

@router.get("")
def get_templates():
    """Module 7: Creative Templates Catalog"""
    return {"templates": list_templates()}

@router.post("/use")
async def apply_template(
    req: UseTemplateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Module 7: Instantiate template with custom product and typography"""
    result = await render_from_template(
        template_id=req.template_id,
        product_name=req.product_name,
        headline=req.headline,
        badge_text=req.badge_text,
        custom_accent=req.custom_accent,
        model_id=req.model_id or "flux-1-schnell"
    )
    
    # Save record
    import uuid
    gen_id = str(uuid.uuid4())
    gen = Generation(
        generation_id=gen_id,
        user_id=current_user.user_id,
        prompt=f"Template {result['template_name']}: {req.product_name}",
        task_type="template_poster",
        model_id=req.model_id or "flux-1-schnell",
        status="completed",
        latency=result["latency"],
        cost=result["cost"],
        aspect_ratio=result["aspect_ratio"]
    )
    db.add(gen)
    db.add(GeneratedMedia(
        generation_id=gen_id,
        media_url=result["media_url"],
        media_type="image/jpeg"
    ))
    db.add(UsageAnalytics(
        user_id=current_user.user_id,
        model_id=req.model_id or "flux-1-schnell",
        task_type="template_poster",
        processing_time=result["latency"],
        estimated_cost=result["cost"],
        status="completed"
    ))
    db.commit()
    
    result["generation_id"] = gen_id
    return result
