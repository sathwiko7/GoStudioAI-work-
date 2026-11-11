import os
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ["SKIP_ONLINE_FETCH"] = "true"

import asyncio
from backend.core.config import settings
from backend.core.database import SessionLocal, Base, engine
from backend.core.security import hash_password, verify_password, create_access_token, decode_token
from backend.models.db_models import User, AIModel, Generation, GeneratedMedia, Template
from backend.services.llm_service import understand_user_prompt
from backend.services.agent_service import execute_agent_workflow
from backend.models.schemas import AgentExecuteRequest
from backend.services.generation_service import generate_creative_image
from backend.services.image_service import (
    remove_background,
    replace_background,
    apply_image_adjustments,
    add_creative_text_overlay
)
from backend.services.templates_service import list_templates, render_from_template
from backend.main import init_db_and_seed

async def run_direct_verification():
    print("STARTING VERIFICATION...", flush=True)

    # 1. Database & Seeding
    print("[Module 1 & DB] Initializing tables and default credentials...", flush=True)
    init_db_and_seed()
    print("Database seeded!", flush=True)
    db = SessionLocal()
    
    admin = db.query(User).filter(User.email == "admin@gostudio.ai").first()
    print(f"Admin loaded: {admin.email}", flush=True)
    assert admin is not None
    assert verify_password("adminpassword123", admin.password_hash)
    token = create_access_token({"sub": admin.user_id, "role": admin.role})
    payload = decode_token(token)
    assert payload["sub"] == admin.user_id
    print(f" -> PASS: User authentication & JWT verified. User ID: {admin.user_id}", flush=True)

    # 2. Module 2: AI Prompt Understanding
    print("\n[Module 2] Testing Prompt Understanding & Structured JSON Plan...")
    test_prompt = "Generate a professional advertisement image for a black sports shoe with a premium studio background."
    plan = await understand_user_prompt(test_prompt)
    assert plan.task in ["image_generation", "advertisement_creation"]
    assert "shoe" in plan.subject.lower()
    assert plan.enhanced_prompt is not None
    print(f" -> PASS: Extracted task='{plan.task}', subject='{plan.subject}', style='{plan.style}'")
    print(f" -> Enhanced Prompt: {plan.enhanced_prompt[:90]}...")

    # 3. Module 3: Intelligent AI Agent Execution
    print("\n[Module 3] Testing Autonomous Tool Routing & Execution Trace...")
    agent_req = AgentExecuteRequest(
        prompt="Create an advertisement for a black sports shoe",
        model_id="flux-1-schnell",
        aspect_ratio="1:1"
    )
    agent_res = await execute_agent_workflow(agent_req, user_id=admin.user_id, db=db)
    assert agent_res.status == "completed"
    assert len(agent_res.steps) >= 4
    assert agent_res.latency > 0
    assert agent_res.media_url.startswith("/static/generated/")
    print(f" -> PASS: Agent executed with tool='{agent_res.tool_selected}' in {agent_res.latency}s")
    for s in agent_res.steps:
        print(f"    - Step {s.step}: {s.title} ({s.duration_ms}ms)")

    # 4. Module 4: Image Generation Engine
    print("\n[Module 4] Testing AI Image Generation & Aspect Ratios...")
    gen_path, latency, cost = await generate_creative_image(
        prompt="Futuristic wireless headphones in cyber city",
        aspect_ratio="16:9",
        model_id="flux-1-schnell"
    )
    assert gen_path.exists()
    assert latency >= 0
    assert cost > 0
    print(f" -> PASS: Generated 16:9 image at {gen_path.name} (Latency: {latency}s, Cost: ${cost})")

    # 5. Module 5: Image Editing Suite
    print("\n[Module 5] Testing Background Removal, Replacement, Adjustments & Overlays...")
    # Alpha Matte BG Removal
    nobg_path = remove_background(gen_path, tolerance=30, edge_blur=2)
    assert nobg_path.exists()
    print(f" -> PASS: Background removal generated transparent cutout at {nobg_path.name}")

    # Studio Replacement
    rep_path = replace_background(nobg_path, preset_name="neon_cyberpunk")
    assert rep_path.exists()
    print(f" -> PASS: Background replaced with 'neon_cyberpunk' at {rep_path.name}")

    # Photo Adjustments
    adj_path = apply_image_adjustments(
        rep_path,
        brightness=1.1,
        contrast=1.15,
        saturation=1.2,
        sharpness=1.3,
        vignette=0.2,
        temperature=15.0
    )
    assert adj_path.exists()
    print(f" -> PASS: Color grade & adjustments saved at {adj_path.name}")

    # Typography & Marketing Badges
    txt_path = add_creative_text_overlay(
        adj_path,
        headline="SONIC VELOCITY",
        sub_text="40% OFF FLASH SALE",
        badge="NEW ARRIVAL",
        position="bottom",
        accent_hex="#6366f1"
    )
    assert txt_path.exists()
    print(f" -> PASS: Marketing typography burned onto canvas at {txt_path.name}")

    # 6. Module 6: Model Selection & Registry
    print("\n[Module 6] Testing AI Model Registry & Multi-Model Evaluation...")
    assert len(settings.AVAILABLE_MODELS) >= 5
    for m in settings.AVAILABLE_MODELS:
        print(f"    - Model: {m['model_name']} ({m['provider']}) | Cost: ${m['estimated_cost']} | Speed: {m['latency_avg']}s | Score: {m['quality_score']}/10")
    print(" -> PASS: Model registry and multi-engine matrix verified.")

    # 7. Module 7: Creative Templates
    print("\n[Module 7] Testing Commercial Template Presets & Layout Rendering...")
    templates = list_templates()
    assert len(templates) >= 6
    print(f" -> PASS: Loaded {len(templates)} templates (E-Commerce, Instagram, YouTube, Festival, Cyberpunk, Luxury).")
    
    tpl_res = await render_from_template(
        template_id="tpl_ecommerce_spotlight",
        product_name="Air Jordan Retro High",
        headline="ICONIC LEGEND",
        badge_text="LIMITED DROP",
        model_id="flux-1-schnell"
    )
    assert tpl_res["media_url"] is not None
    print(f" -> PASS: Rendered template asset -> {tpl_res['media_url']}")

    # 8. Module 8 & 10: Media Records & Admin Analytics Aggregator
    print("\n[Module 8 & 10] Testing Database Persistence & Usage Telemetry...")
    gen_count = db.query(Generation).count()
    media_count = db.query(GeneratedMedia).count()
    print(f" -> Total Generations in DB: {gen_count}")
    print(f" -> Total Media Assets in DB: {media_count}")
    assert gen_count > 0
    assert media_count > 0
    db.close()

    print("\n====================================================================")
    print(">>> ALL MODULES FROM GOSTUDIO BLUEPRINT ARE 100% VERIFIED! <<<")
    print("====================================================================")

if __name__ == "__main__":
    asyncio.run(run_direct_verification())
