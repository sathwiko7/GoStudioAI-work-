from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# ----------------- Auth Schemas -----------------
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserProfile(BaseModel):
    user_id: str
    name: str
    email: str
    role: str
    avatar_url: Optional[str] = None
    created_at: str

# ----------------- Module 2: Prompt Understanding -----------------
class StructuredTaskPlan(BaseModel):
    task: str = Field(..., description="image_generation | background_removal | image_editing | advertisement_creation | template_poster")
    category: str = Field("product", description="product | portrait | fashion | marketing | social_media | concept")
    subject: str = Field(..., description="Extracted central subject")
    background: str = Field("studio", description="Identified or suggested background")
    style: str = Field("professional advertisement", description="Target visual style")
    quality: str = Field("high", description="standard | high | ultra")
    aspect_ratio: str = Field("1:1", description="1:1 | 16:9 | 9:16 | 4:5 | 3:2")
    enhanced_prompt: str = Field(..., description="Expanded prompt with photographic precision")
    negative_prompt: str = Field("blurry, low quality, artifacts, distorted, noisy, watermarks")
    recommended_model: str = Field("flux-1-schnell")
    confidence_score: float = Field(0.98)

# ----------------- Module 3: Intelligent Agent -----------------
class AgentThoughtStep(BaseModel):
    step: int
    title: str
    description: str
    status: str = "completed"  # pending, working, completed, failed
    duration_ms: int = 150
    details: Optional[Dict[str, Any]] = None

class AgentExecuteRequest(BaseModel):
    prompt: str
    project_id: Optional[str] = None
    model_id: Optional[str] = None
    aspect_ratio: Optional[str] = None
    style: Optional[str] = None
    image_url: Optional[str] = None  # Reference or input image for editing/bg removal
    options: Optional[Dict[str, Any]] = None

class AgentExecuteResponse(BaseModel):
    generation_id: str
    task_type: str
    tool_selected: str
    model_used: str
    original_prompt: str
    enhanced_prompt: str
    structured_plan: StructuredTaskPlan
    steps: List[AgentThoughtStep]
    media_url: str
    aspect_ratio: str
    latency: float
    estimated_cost: float
    status: str

# ----------------- Module 4: Image Generation -----------------
class GenerateImageRequest(BaseModel):
    prompt: str
    enhanced_prompt: Optional[str] = None
    model_id: str = "flux-1-schnell"
    aspect_ratio: str = "1:1"
    style: str = "cinematic studio"
    negative_prompt: Optional[str] = "blurry, low quality, distorted"
    seed: Optional[int] = None
    cfg_scale: float = 7.5
    steps: int = 25
    project_id: Optional[str] = None

class MediaItem(BaseModel):
    media_id: str
    generation_id: str
    media_url: str
    media_type: str
    width: int
    height: int
    file_size_kb: float
    is_favorite: bool
    created_at: str

# ----------------- Module 5: Image Editing -----------------
class BackgroundRemovalRequest(BaseModel):
    image_url: str
    tolerance: int = 30
    edge_blur: int = 2

class BackgroundReplacementRequest(BaseModel):
    image_url: str
    background_type: str = "preset"  # preset | custom_prompt
    preset_name: Optional[str] = "studio_white"  # studio_white, neon_cyberpunk, dark_marble, luxury_bokeh, pastel_gradient
    custom_background_prompt: Optional[str] = None

class ImageAdjustmentsRequest(BaseModel):
    image_url: str
    brightness: float = 1.0     # 0.2 to 2.0
    contrast: float = 1.0       # 0.2 to 2.0
    saturation: float = 1.0     # 0.0 to 2.0
    sharpness: float = 1.0      # 0.0 to 3.0
    vignette: float = 0.0       # 0.0 to 1.0
    temperature: float = 0.0    # -100 to 100

class TextOverlayRequest(BaseModel):
    image_url: str
    headline_text: str = "SUMMER SALE"
    sub_text: Optional[str] = "UP TO 50% OFF"
    badge_text: Optional[str] = "LIMITED EDITION"
    position: str = "bottom"  # top, center, bottom
    accent_color: str = "#6366f1"

# ----------------- Module 6: Model Selection & Comparison -----------------
class ModelCompareRequest(BaseModel):
    prompt: str
    model_ids: List[str] = ["flux-1-schnell", "sd-3.5-large", "midjourney-v6"]
    aspect_ratio: str = "1:1"
    style: str = "hyper-realistic"

class ModelCompareItem(BaseModel):
    model_id: str
    model_name: str
    provider: str
    media_url: str
    latency: float
    estimated_cost: float
    quality_score: float
    badge: str

class ModelCompareResponse(BaseModel):
    prompt: str
    results: List[ModelCompareItem]

# ----------------- Module 7: Templates -----------------
class TemplateItem(BaseModel):
    template_id: str
    template_name: str
    category: str
    aspect_ratio: str
    default_prompt: str
    headline: str
    badge: str
    tags: List[str]
    thumbnail_url: str
    description: str

class UseTemplateRequest(BaseModel):
    template_id: str
    product_name: str
    headline: Optional[str] = None
    badge_text: Optional[str] = None
    custom_accent: Optional[str] = None
    model_id: Optional[str] = "flux-1-schnell"

# ----------------- Module 8: Projects -----------------
class ProjectCreate(BaseModel):
    project_name: str
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    project_id: str
    project_name: str
    description: Optional[str] = None
    created_at: str
    generation_count: int = 0

# ----------------- Module 10: Admin Analytics -----------------
class AnalyticsOverview(BaseModel):
    total_users: int
    total_generations: int
    total_expenditure_usd: float
    avg_latency_sec: float
    success_rate_percent: float
    model_usage_breakdown: List[Dict[str, Any]]
    daily_trend: List[Dict[str, Any]]
    task_distribution: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]
