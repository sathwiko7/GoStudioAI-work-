import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
UPLOADS_DIR = STATIC_DIR / "uploads"
GENERATED_DIR = STATIC_DIR / "generated"
TEMPLATES_DIR = STATIC_DIR / "templates"

for directory in [STATIC_DIR, UPLOADS_DIR, GENERATED_DIR, TEMPLATES_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "GoStudio AI - Creative Studio & Intelligent Agent"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "gostudio_super_secret_jwt_key_2026_xyz_creative_studio")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{str(BASE_DIR / 'gostudio.db').replace(os.sep, '/')}")
    
    # AI Providers (can be overridden via environment or runtime settings)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    STABILITY_API_KEY: str = os.getenv("STABILITY_API_KEY", "")
    REPLICATE_API_TOKEN: str = os.getenv("REPLICATE_API_TOKEN", "")
    
    # Model Catalog
    AVAILABLE_MODELS: list = [
        {
            "model_id": "flux-1-schnell",
            "model_name": "FLUX.1 [schnell]",
            "provider": "Black Forest Labs",
            "supported_tasks": ["image_generation", "advertisement_creation", "template_poster"],
            "estimated_cost": 0.003,
            "latency_avg": 2.6,
            "quality_score": 9.6,
            "badge": "Fastest & Sharp",
            "description": "State-of-the-art flow transformer with ultra-crisp typography and studio rendering."
        },
        {
            "model_id": "sd-3.5-large",
            "model_name": "Stable Diffusion 3.5 Large",
            "provider": "Stability AI",
            "supported_tasks": ["image_generation", "image_editing", "advertisement_creation"],
            "estimated_cost": 0.006,
            "latency_avg": 3.4,
            "quality_score": 9.4,
            "badge": "High Fidelity",
            "description": "Multi-aspect photorealistic diffusion engine tailored for commercial product assets."
        },
        {
            "model_id": "midjourney-v6",
            "model_name": "Midjourney v6.1 Ultra",
            "provider": "Midjourney API Engine",
            "supported_tasks": ["image_generation", "template_poster"],
            "estimated_cost": 0.009,
            "latency_avg": 4.1,
            "quality_score": 9.8,
            "badge": "Highest Aesthetic",
            "description": "Cinematic composition, realistic lighting reflections, and artistic mastery."
        },
        {
            "model_id": "dall-e-3",
            "model_name": "DALL-E 3 HD",
            "provider": "OpenAI",
            "supported_tasks": ["image_generation", "advertisement_creation"],
            "estimated_cost": 0.040,
            "latency_avg": 5.2,
            "quality_score": 9.5,
            "badge": "Prompt Adherence",
            "description": "Deep nuance comprehension and faithful execution of intricate prompt descriptions."
        },
        {
            "model_id": "playground-v2.5",
            "model_name": "Playground v2.5 Aesthetic",
            "provider": "Playground AI",
            "supported_tasks": ["image_generation", "template_poster"],
            "estimated_cost": 0.002,
            "latency_avg": 2.1,
            "quality_score": 9.1,
            "badge": "Budget Champion",
            "description": "Ultra low cost per render with optimized social-media aesthetic saturation."
        }
    ]

settings = Settings()
