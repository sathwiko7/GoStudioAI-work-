from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from backend.core.database import get_db
from backend.api.auth import get_current_user
from backend.models.db_models import User, Project, Generation
from backend.models.schemas import ProjectCreate

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("")
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    projects = (
        db.query(Project)
        .filter(Project.user_id == current_user.user_id)
        .order_by(desc(Project.created_at))
        .all()
    )
    res = []
    for p in projects:
        count = db.query(Generation).filter(Generation.project_id == p.project_id).count()
        res.append({
            "project_id": p.project_id,
            "project_name": p.project_name,
            "description": p.description,
            "created_at": str(p.created_at),
            "generation_count": count
        })
    return {"projects": res}

@router.post("")
def create_project(
    req: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    p = Project(
        user_id=current_user.user_id,
        project_name=req.project_name.strip(),
        description=req.description
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return {
        "project_id": p.project_id,
        "project_name": p.project_name,
        "description": p.description,
        "created_at": str(p.created_at),
        "generation_count": 0
    }
