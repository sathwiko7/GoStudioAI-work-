import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="user")  # 'user' or 'admin'
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    generations = relationship("Generation", back_populates="user", cascade="all, delete-orphan")
    usage_records = relationship("UsageAnalytics", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"
    
    project_id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False, index=True)
    project_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    user = relationship("User", back_populates="projects")
    generations = relationship("Generation", back_populates="project", cascade="all, delete-orphan")


class AIModel(Base):
    __tablename__ = "ai_models"
    
    model_id = Column(String(100), primary_key=True)
    model_name = Column(String(100), nullable=False)
    provider = Column(String(100), nullable=False)
    supported_tasks = Column(Text, nullable=False)  # JSON-encoded array
    estimated_cost = Column(Float, default=0.005)
    latency_avg = Column(Float, default=3.0)
    quality_score = Column(Float, default=9.5)
    badge = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)


class Generation(Base):
    __tablename__ = "generations"
    
    generation_id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False, index=True)
    project_id = Column(String(36), ForeignKey("projects.project_id"), nullable=True, index=True)
    prompt = Column(Text, nullable=False)
    enhanced_prompt = Column(Text, nullable=True)
    task_type = Column(String(50), default="image_generation")
    model_id = Column(String(100), ForeignKey("ai_models.model_id"), nullable=True)
    status = Column(String(50), default="completed", index=True)  # pending, processing, completed, failed
    latency = Column(Float, default=0.0)
    cost = Column(Float, default=0.0)
    aspect_ratio = Column(String(20), default="1:1")
    style = Column(String(50), default="realistic")
    parameters_json = Column(Text, nullable=True)  # JSON metadata (seed, agent trace, etc.)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    user = relationship("User", back_populates="generations")
    project = relationship("Project", back_populates="generations")
    media_files = relationship("GeneratedMedia", back_populates="generation", cascade="all, delete-orphan")


class GeneratedMedia(Base):
    __tablename__ = "generated_media"
    
    media_id = Column(String(36), primary_key=True, default=generate_uuid)
    generation_id = Column(String(36), ForeignKey("generations.generation_id"), nullable=False, index=True)
    media_url = Column(String(500), nullable=False)
    media_type = Column(String(50), default="image/png")
    width = Column(Integer, default=1024)
    height = Column(Integer, default=1024)
    file_size_kb = Column(Float, default=0.0)
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    generation = relationship("Generation", back_populates="media_files")


class Template(Base):
    __tablename__ = "templates"
    
    template_id = Column(String(100), primary_key=True)
    template_name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)  # ecommerce, social_media, thumbnail, banner, poster
    configuration = Column(Text, nullable=False)  # JSON layout & prompt guidelines
    thumbnail_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class UsageAnalytics(Base):
    __tablename__ = "usage_analytics"
    
    usage_id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False, index=True)
    model_id = Column(String(100), nullable=True)
    task_type = Column(String(50), default="image_generation")
    processing_time = Column(Float, default=0.0)
    estimated_cost = Column(Float, default=0.0)
    status = Column(String(50), default="completed")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    user = relationship("User", back_populates="usage_records")
