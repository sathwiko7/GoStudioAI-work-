import os
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.core.config import settings, STATIC_DIR, BASE_DIR
from backend.core.database import engine, Base, SessionLocal
from backend.core.security import hash_password
from backend.models.db_models import User, AIModel, Project
from backend.api import (
    auth,
    agent,
    generation,
    editing,
    models_comparison,
    templates,
    media,
    projects,
    analytics
)

def init_db_and_seed():
    """Create all tables and seed initial users, models and sample project"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed Admin User
        admin = db.query(User).filter(User.email == "admin@gostudio.ai").first()
        if not admin:
            admin = User(
                name="GoStudio Admin",
                email="admin@gostudio.ai",
                password_hash=hash_password("adminpassword123"),
                role="admin",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            )
            db.add(admin)
            
        # Seed Creator User
        creator = db.query(User).filter(User.email == "creator@gostudio.ai").first()
        if not creator:
            creator = User(
                name="Sathwik Creative Director",
                email="creator@gostudio.ai",
                password_hash=hash_password("creatorpass123"),
                role="user",
                avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
            )
            db.add(creator)
            db.commit()
            db.refresh(creator)
            
            # Add sample project
            demo_project = Project(
                user_id=creator.user_id,
                project_name="Nike AlphaFly 3 Campaign",
                description="High-octane commercial creative assets and banner generation."
            )
            db.add(demo_project)
            
        # Seed Models
        for m in settings.AVAILABLE_MODELS:
            exists = db.query(AIModel).filter(AIModel.model_id == m["model_id"]).first()
            if not exists:
                db_model = AIModel(
                    model_id=m["model_id"],
                    model_name=m["model_name"],
                    provider=m["provider"],
                    supported_tasks=json.dumps(m["supported_tasks"]),
                    estimated_cost=m["estimated_cost"],
                    latency_avg=m["latency_avg"],
                    quality_score=m["quality_score"],
                    badge=m.get("badge"),
                    description=m.get("description")
                )
                db.add(db_model)
                
        db.commit()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db_and_seed()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent AI Agent & Creative Media Studio for GoStudio AI",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static media files mounting
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Mount Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(agent.router, prefix=settings.API_V1_STR)
app.include_router(generation.router, prefix=settings.API_V1_STR)
app.include_router(editing.router, prefix=settings.API_V1_STR)
app.include_router(models_comparison.router, prefix=settings.API_V1_STR)
app.include_router(templates.router, prefix=settings.API_V1_STR)
app.include_router(media.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs"
    }


# WebSocket for Module 9: Live background updates
@app.websocket("/ws/generation-status/{job_id}")
async def websocket_generation_status(websocket: WebSocket, job_id: str):
    await websocket.accept()
    try:
        stages = [
            {"progress": 20, "stage": "Analyzing natural-language prompt with LLM..."},
            {"progress": 45, "stage": "Selecting optimal AI model & tool routing..."},
            {"progress": 70, "stage": "Diffusing image & neural latent tensor processing..."},
            {"progress": 90, "stage": "Calibrating studio lighting, color grading & contrast..."},
            {"progress": 100, "stage": "Generation complete! Asset stored in Media Library."}
        ]
        import asyncio
        for s in stages:
            await asyncio.sleep(0.6)
            await websocket.send_json({"job_id": job_id, **s})
    except WebSocketDisconnect:
        pass
