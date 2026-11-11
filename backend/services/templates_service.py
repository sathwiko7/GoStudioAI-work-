import json
from typing import List, Dict, Any
from pathlib import Path
from backend.models.schemas import TemplateItem
from backend.services.generation_service import generate_creative_image
from backend.services.image_service import add_creative_text_overlay

BUILTIN_TEMPLATES: List[TemplateItem] = [
    TemplateItem(
        template_id="tpl_ecommerce_spotlight",
        template_name="E-Commerce Product Spotlight",
        category="Product Ads",
        aspect_ratio="1:1",
        default_prompt="Premium futuristic black and neon green running sneaker floating on a dark glass reflective podium with studio laser lights",
        headline="NEXT-GEN VELOCITY",
        badge="FLASH SALE • 40% OFF",
        tags=["E-Commerce", "Product", "Footwear", "Commercial"],
        thumbnail_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
        description="High-converting commercial product stage with bold price pill badge and sleek pedestal lighting."
    ),
    TemplateItem(
        template_id="tpl_insta_story_reel",
        template_name="Instagram Story / Reel Promo",
        category="Social Media",
        aspect_ratio="9:16",
        default_prompt="Fashion model wearing futuristic oversized streetwear hoodie in Tokyo neon rain street, cinematic bokeh, vibrant pink and cyan hues",
        headline="NEW DROP LIVE",
        badge="EXCLUSIVE VIP",
        tags=["Instagram", "TikTok", "Story", "Streetwear"],
        thumbnail_url="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
        description="Vertical 9:16 format optimized for mobile swipe-ups, reel hooks, and high-engagement launches."
    ),
    TemplateItem(
        template_id="tpl_youtube_thumbnail",
        template_name="YouTube High-CTR Thumbnail",
        category="YouTube",
        aspect_ratio="16:9",
        default_prompt="Shocked tech reviewer holding an ultra-thin transparent glowing holographic smartphone with energetic amber and purple rim lighting",
        headline="I WAS WRONG ABOUT THIS!",
        badge="UNBOXING 2026",
        tags=["YouTube", "Thumbnail", "Tech", "High-CTR"],
        thumbnail_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
        description="Punchy 16:9 high-contrast thumbnail designed to maximize click-through rate on video platforms."
    ),
    TemplateItem(
        template_id="tpl_holiday_festival",
        template_name="Festival & Holiday Greeting Banner",
        category="Banners",
        aspect_ratio="16:9",
        default_prompt="Magnificent golden sparkling festive ornaments, warm glowing fairy lights, celebratory confetti, rich crimson and champagne silk background",
        headline="SEASON OF CELEBRATION",
        badge="HOLIDAY SPECIAL",
        tags=["Festival", "Holiday", "Celebration", "Banner"],
        thumbnail_url="https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600&auto=format&fit=crop&q=80",
        description="Celebratory promotional banner with warm golden bokeh, seasonal accents, and celebratory elegance."
    ),
    TemplateItem(
        template_id="tpl_cyberpunk_launch",
        template_name="Cyberpunk Tech Product Launch",
        category="Tech Posters",
        aspect_ratio="4:5",
        default_prompt="Sleek wireless noise-canceling headphones hovering above a glowing cybernetic circuit matrix with violet reflections and vapor trails",
        headline="SONIC ASCENSION",
        badge="PRE-ORDER NOW",
        tags=["Tech", "Cyberpunk", "Audio", "Modern"],
        thumbnail_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
        description="Dark futuristic layout featuring circuit reflections, HUD badges, and high-impact cyber aesthetic."
    ),
    TemplateItem(
        template_id="tpl_luxury_lookbook",
        template_name="Luxury Minimalist Lookbook",
        category="Editorial",
        aspect_ratio="3:2",
        default_prompt="Artistic luxury Swiss chronograph watch resting on textured natural travertine stone with soft morning sunlight casting geometric shadows",
        headline="TIMELESS PRECISION",
        badge="LIMITED TO 50 PIECES",
        tags=["Luxury", "Watch", "Editorial", "Minimalist"],
        thumbnail_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        description="Refined editorial showcase using architectural shadows, warm stone textures, and understated typography."
    )
]

def list_templates() -> List[TemplateItem]:
    return BUILTIN_TEMPLATES

def get_template_by_id(template_id: str) -> TemplateItem:
    for tpl in BUILTIN_TEMPLATES:
        if tpl.template_id == template_id:
            return tpl
    return BUILTIN_TEMPLATES[0]

async def render_from_template(
    template_id: str,
    product_name: str,
    headline: str = None,
    badge_text: str = None,
    custom_accent: str = "#6366f1",
    model_id: str = "flux-1-schnell"
) -> Dict[str, Any]:
    tpl = get_template_by_id(template_id)
    
    # Enrich prompt with user's product name
    prompt = f"{tpl.default_prompt}, featuring {product_name}"
    
    img_path, latency, cost = await generate_creative_image(
        prompt=prompt,
        aspect_ratio=tpl.aspect_ratio,
        model_id=model_id
    )
    
    final_headline = headline or tpl.headline
    final_badge = badge_text or tpl.badge
    
    out_path = add_creative_text_overlay(
        image_path=img_path,
        headline=final_headline,
        sub_text=f"Featuring {product_name}",
        badge=final_badge,
        position="bottom" if tpl.aspect_ratio != "16:9" else "top",
        accent_hex=custom_accent or "#6366f1"
    )
    
    return {
        "media_url": f"/static/generated/{out_path.name}",
        "template_id": tpl.template_id,
        "template_name": tpl.template_name,
        "aspect_ratio": tpl.aspect_ratio,
        "latency": latency,
        "cost": cost + 0.001
    }
