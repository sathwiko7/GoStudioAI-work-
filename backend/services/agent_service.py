import time
import uuid
from typing import List, Dict, Any, Optional
from pathlib import Path
from sqlalchemy.orm import Session

from backend.models.schemas import (
    StructuredTaskPlan,
    AgentThoughtStep,
    AgentExecuteRequest,
    AgentExecuteResponse
)
from backend.models.db_models import Generation, GeneratedMedia, UsageAnalytics
from backend.services.llm_service import understand_user_prompt
from backend.services.generation_service import generate_creative_image
from backend.services.image_service import (
    resolve_image_path,
    remove_background,
    replace_background,
    add_creative_text_overlay,
    apply_image_adjustments
)

# Registry of supported agent tools
SUPPORTED_TOOLS = [
    "tool_text_to_image_diffusion",
    "tool_background_removal_alpha_matte",
    "tool_background_replacement_cyclorama",
    "tool_advertisement_typography_overlay",
    "tool_template_composition"
]

def select_tool(task: str, has_input_image: bool) -> str:
    """
    Deterministic & safety-validated tool router from Module 3 blueprint.
    """
    if task == "background_removal":
        return "tool_background_removal_alpha_matte"
    elif task == "image_editing":
        return "tool_background_replacement_cyclorama"
    elif task == "advertisement_creation":
        return "tool_advertisement_typography_overlay"
    elif task == "template_poster":
        return "tool_template_composition"
    else:
        return "tool_text_to_image_diffusion"

async def execute_agent_workflow(
    request: AgentExecuteRequest,
    user_id: str,
    db: Session
) -> AgentExecuteResponse:
    """
    Full intelligent agent orchestration pipeline:
    1. Prompt Understanding (Module 2)
    2. Tool Selection & Permission Boundary (Module 3)
    3. Input Validation
    4. Execution with latency & cost logging
    5. Database persistence & Media indexing
    """
    total_start = time.time()
    steps: List[AgentThoughtStep] = []
    
    # Step 1: Prompt Understanding
    s1_start = time.time()
    plan: StructuredTaskPlan = await understand_user_prompt(request.prompt)
    s1_dur = int((time.time() - s1_start) * 1000)
    steps.append(AgentThoughtStep(
        step=1,
        title="Prompt Understanding & Semantic Analysis",
        description=f"Identified operation '{plan.task}' for subject '{plan.subject}' with '{plan.style}' aesthetic.",
        duration_ms=s1_dur,
        details={
            "task": plan.task,
            "category": plan.category,
            "subject": plan.subject,
            "background": plan.background,
            "confidence": plan.confidence_score
        }
    ))
    
    # Step 2: Tool Routing & Policy Enforcement
    s2_start = time.time()
    selected_tool = select_tool(plan.task, bool(request.image_url))
    assert selected_tool in SUPPORTED_TOOLS, f"Unauthorized tool selection: {selected_tool}"
    s2_dur = int((time.time() - s2_start) * 1000)
    steps.append(AgentThoughtStep(
        step=2,
        title="Tool Router & Policy Selection",
        description=f"Routed workflow to verified executor: '{selected_tool}'.",
        duration_ms=s2_dur,
        details={"tool_selected": selected_tool, "allowed_tools_count": len(SUPPORTED_TOOLS)}
    ))
    
    # Step 3: Model Allocation & Parameter Calibration
    s3_start = time.time()
    model_to_use = request.model_id or plan.recommended_model
    aspect_ratio_to_use = request.aspect_ratio or plan.aspect_ratio
    s3_dur = int((time.time() - s3_start) * 1000)
    steps.append(AgentThoughtStep(
        step=3,
        title="Model Allocation & Engine Calibration",
        description=f"Allocated generative model '{model_to_use}' with aspect ratio {aspect_ratio_to_use}.",
        duration_ms=s3_dur,
        details={"model_id": model_to_use, "aspect_ratio": aspect_ratio_to_use}
    ))
    
    # Step 4: Core Execution Pipeline
    s4_start = time.time()
    resulting_image_path: Path
    gen_latency: float = 0.0
    gen_cost: float = 0.0
    
    if selected_tool == "tool_background_removal_alpha_matte":
        if not request.image_url:
            # Generate source image first if none provided
            src_path, gen_latency, gen_cost = await generate_creative_image(
                prompt=plan.enhanced_prompt,
                aspect_ratio=aspect_ratio_to_use,
                model_id=model_to_use
            )
            resulting_image_path = remove_background(src_path)
        else:
            local_path = resolve_image_path(request.image_url)
            resulting_image_path = remove_background(local_path)
            gen_cost = 0.001
            
    elif selected_tool == "tool_background_replacement_cyclorama":
        if not request.image_url:
            src_path, gen_latency, gen_cost = await generate_creative_image(
                prompt=plan.enhanced_prompt,
                aspect_ratio=aspect_ratio_to_use,
                model_id=model_to_use
            )
            cutout = remove_background(src_path)
            preset = "neon_cyberpunk" if "cyber" in plan.style else "studio_white"
            resulting_image_path = replace_background(cutout, preset_name=preset)
        else:
            local_path = resolve_image_path(request.image_url)
            preset = "neon_cyberpunk" if "cyber" in plan.style else "studio_white"
            resulting_image_path = replace_background(local_path, preset_name=preset)
            gen_cost = 0.002
            
    elif selected_tool == "tool_advertisement_typography_overlay":
        # First generate crisp hero image
        src_path, gen_latency, gen_cost = await generate_creative_image(
            prompt=plan.enhanced_prompt,
            aspect_ratio=aspect_ratio_to_use,
            model_id=model_to_use
        )
        # Apply marketing badge and headline overlay
        headline = (request.options or {}).get("headline") or f"{plan.subject.upper()}"
        sub_text = (request.options or {}).get("sub_text") or "EXCLUSIVE NEW ARRIVAL • SHOP NOW"
        badge = (request.options or {}).get("badge") or "OFFICIAL RELEASE"
        resulting_image_path = add_creative_text_overlay(
            image_path=src_path,
            headline=headline[:30],
            sub_text=sub_text[:45],
            badge=badge[:20],
            position="bottom",
            accent_hex="#6366f1"
        )
        gen_cost += 0.001
        
    elif selected_tool == "tool_template_composition":
        src_path, gen_latency, gen_cost = await generate_creative_image(
            prompt=plan.enhanced_prompt,
            aspect_ratio=aspect_ratio_to_use,
            model_id=model_to_use
        )
        headline = (request.options or {}).get("headline") or "TRENDING NOW"
        badge = (request.options or {}).get("badge") or "POPULAR"
        resulting_image_path = add_creative_text_overlay(
            image_path=src_path,
            headline=headline,
            sub_text="Designed with GoStudio Intelligent Agent",
            badge=badge,
            position="top",
            accent_hex="#ec4899"
        )
    else:  # tool_text_to_image_diffusion
        src_path, gen_latency, gen_cost = await generate_creative_image(
            prompt=plan.enhanced_prompt,
            aspect_ratio=aspect_ratio_to_use,
            model_id=model_to_use
        )
        resulting_image_path = src_path
        
    s4_dur = int((time.time() - s4_start) * 1000)
    steps.append(AgentThoughtStep(
        step=4,
        title="Execution & Render Engine",
        description=f"Generated asset in {resulting_image_path.name} via tool pipeline.",
        duration_ms=s4_dur,
        details={"output_file": resulting_image_path.name, "bytes": resulting_image_path.stat().st_size}
    ))
    
    # Step 5: Post-processing and Artifact Indexing
    s5_start = time.time()
    media_url = f"/static/generated/{resulting_image_path.name}"
    total_latency = round(time.time() - total_start, 2)
    
    # Persist in Database
    gen_id = str(uuid.uuid4())
    generation_record = Generation(
        generation_id=gen_id,
        user_id=user_id,
        project_id=request.project_id,
        prompt=request.prompt,
        enhanced_prompt=plan.enhanced_prompt,
        task_type=plan.task,
        model_id=model_to_use,
        status="completed",
        latency=total_latency,
        cost=gen_cost,
        aspect_ratio=aspect_ratio_to_use,
        style=plan.style
    )
    db.add(generation_record)
    
    # Persist Media record
    media_record = GeneratedMedia(
        generation_id=gen_id,
        media_url=media_url,
        media_type="image/png" if media_url.endswith(".png") else "image/jpeg",
        file_size_kb=round(resulting_image_path.stat().st_size / 1024, 1)
    )
    db.add(media_record)
    
    # Usage Analytics record
    usage_record = UsageAnalytics(
        user_id=user_id,
        model_id=model_to_use,
        task_type=plan.task,
        processing_time=total_latency,
        estimated_cost=gen_cost,
        status="completed"
    )
    db.add(usage_record)
    db.commit()
    
    s5_dur = int((time.time() - s5_start) * 1000)
    steps.append(AgentThoughtStep(
        step=5,
        title="Artifact Cataloging & Database Indexing",
        description="Stored output media metadata and updated analytics registers.",
        duration_ms=s5_dur
    ))
    
    return AgentExecuteResponse(
        generation_id=gen_id,
        task_type=plan.task,
        tool_selected=selected_tool,
        model_used=model_to_use,
        original_prompt=request.prompt,
        enhanced_prompt=plan.enhanced_prompt,
        structured_plan=plan,
        steps=steps,
        media_url=media_url,
        aspect_ratio=aspect_ratio_to_use,
        latency=total_latency,
        estimated_cost=gen_cost,
        status="completed"
    )
