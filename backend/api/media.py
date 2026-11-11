from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.core.database import get_db
from backend.api.auth import get_current_user
from backend.models.db_models import User, Generation, GeneratedMedia

router = APIRouter(prefix="/media", tags=["Media Library"])

@router.get("")
def list_user_media(
    project_id: Optional[str] = None,
    favorite_only: bool = False,
    task_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Module 8: Media Library & Generation History with filtering and favorites"""
    query = (
        db.query(GeneratedMedia, Generation)
        .join(Generation, GeneratedMedia.generation_id == Generation.generation_id)
        .filter(Generation.user_id == current_user.user_id)
    )
    
    if project_id:
        query = query.filter(Generation.project_id == project_id)
    if favorite_only:
        query = query.filter(GeneratedMedia.is_favorite == True)
    if task_type:
        query = query.filter(Generation.task_type == task_type)
        
    records = query.order_by(desc(Generation.created_at)).limit(limit).all()
    
    items = []
    for media, gen in records:
        items.append({
            "media_id": media.media_id,
            "generation_id": gen.generation_id,
            "media_url": media.media_url,
            "media_type": media.media_type,
            "prompt": gen.prompt,
            "enhanced_prompt": gen.enhanced_prompt,
            "task_type": gen.task_type,
            "model_id": gen.model_id,
            "aspect_ratio": gen.aspect_ratio,
            "latency": gen.latency,
            "cost": gen.cost,
            "is_favorite": media.is_favorite,
            "created_at": str(gen.created_at)
        })
    return {"media": items, "count": len(items)}

@router.post("/{media_id}/favorite")
def toggle_favorite(
    media_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    media = (
        db.query(GeneratedMedia)
        .join(Generation, GeneratedMedia.generation_id == Generation.generation_id)
        .filter(GeneratedMedia.media_id == media_id, Generation.user_id == current_user.user_id)
        .first()
    )
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
        
    media.is_favorite = not media.is_favorite
    db.commit()
    return {"media_id": media_id, "is_favorite": media.is_favorite}

@router.delete("/{media_id}")
def delete_media(
    media_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    media = (
        db.query(GeneratedMedia)
        .join(Generation, GeneratedMedia.generation_id == Generation.generation_id)
        .filter(GeneratedMedia.media_id == media_id, Generation.user_id == current_user.user_id)
        .first()
    )
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
        
    db.delete(media)
    db.commit()
    return {"success": True, "deleted_id": media_id}
