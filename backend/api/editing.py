import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.core.config import UPLOADS_DIR
from backend.api.auth import get_current_user
from backend.models.db_models import User, Generation, GeneratedMedia, UsageAnalytics
from backend.models.schemas import (
    BackgroundRemovalRequest,
    BackgroundReplacementRequest,
    ImageAdjustmentsRequest,
    TextOverlayRequest
)
from backend.services.image_service import (
    resolve_image_path,
    remove_background,
    replace_background,
    apply_image_adjustments,
    add_creative_text_overlay
)

router = APIRouter(prefix="/edit", tags=["AI Image Editing"])

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload user photo for editing or background removal"""
    ext = Path(file.filename).suffix or ".jpg"
    filename = f"upload_{uuid.uuid4().hex[:10]}{ext}"
    target_path = UPLOADS_DIR / filename
    
    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {
        "media_url": f"/static/uploads/{filename}",
        "filename": filename,
        "size_kb": round(target_path.stat().st_size / 1024, 1)
    }

@router.post("/remove-bg")
async def remove_bg_endpoint(
    req: BackgroundRemovalRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Module 5: Background Removal with edge feathering alpha matte"""
    local_path = resolve_image_path(req.image_url)
    out_path = remove_background(local_path, tolerance=req.tolerance, edge_blur=req.edge_blur)
    media_url = f"/static/generated/{out_path.name}"
    
    # Record history
    gen_id = str(uuid.uuid4())
    gen = Generation(
        generation_id=gen_id,
        user_id=current_user.user_id,
        prompt="Background removal",
        task_type="background_removal",
        model_id="gostudio-alpha-engine",
        status="completed",
        latency=0.35,
        cost=0.001
    )
    db.add(gen)
    db.add(GeneratedMedia(
        generation_id=gen_id,
        media_url=media_url,
        media_type="image/png",
        file_size_kb=round(out_path.stat().st_size / 1024, 1)
    ))
    db.commit()
    
    return {"media_url": media_url, "generation_id": gen_id, "success": True}

@router.post("/replace-bg")
async def replace_bg_endpoint(
    req: BackgroundReplacementRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Module 5: Background Replacement with studio, cyberpunk, or dark marble backdrop"""
    local_path = resolve_image_path(req.image_url)
    # If not transparent, remove background first
    if not local_path.name.startswith("nobg_"):
        local_path = remove_background(local_path)
        
    out_path = replace_background(local_path, preset_name=req.preset_name)
    media_url = f"/static/generated/{out_path.name}"
    
    gen_id = str(uuid.uuid4())
    db.add(Generation(
        generation_id=gen_id,
        user_id=current_user.user_id,
        prompt=f"Background replacement: {req.preset_name}",
        task_type="image_editing",
        model_id="gostudio-compositor",
        status="completed",
        latency=0.45,
        cost=0.002
    ))
    db.add(GeneratedMedia(
        generation_id=gen_id,
        media_url=media_url,
        media_type="image/jpeg",
        file_size_kb=round(out_path.stat().st_size / 1024, 1)
    ))
    db.commit()
    
    return {"media_url": media_url, "generation_id": gen_id, "success": True}

@router.post("/adjust")
async def adjust_image_endpoint(
    req: ImageAdjustmentsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Module 5: Precision photographic adjustments (brightness, contrast, saturation, sharpness, temperature)"""
    local_path = resolve_image_path(req.image_url)
    out_path = apply_image_adjustments(
        image_path=local_path,
        brightness=req.brightness,
        contrast=req.contrast,
        saturation=req.saturation,
        sharpness=req.sharpness,
        vignette=req.vignette,
        temperature=req.temperature
    )
    media_url = f"/static/generated/{out_path.name}"
    return {"media_url": media_url, "success": True}

@router.post("/overlay")
async def text_overlay_endpoint(
    req: TextOverlayRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Module 5: Promotional headline & badge graphic overlay"""
    local_path = resolve_image_path(req.image_url)
    out_path = add_creative_text_overlay(
        image_path=local_path,
        headline=req.headline_text,
        sub_text=req.sub_text,
        badge=req.badge_text,
        position=req.position,
        accent_hex=req.accent_color
    )
    media_url = f"/static/generated/{out_path.name}"
    return {"media_url": media_url, "success": True}
