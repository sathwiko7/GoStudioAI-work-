import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_module_1_auth():
    # Test register new user
    import uuid
    email = f"test_{uuid.uuid4().hex[:6]}@gostudio.ai"
    reg_res = client.post("/api/auth/register", json={
        "name": "Test Engineer",
        "email": email,
        "password": "securepassword123",
        "role": "user"
    })
    assert reg_res.status_code == 200, reg_res.text
    token = reg_res.json()["access_token"]
    assert token is not None
    
    # Test login
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": "securepassword123"
    })
    assert login_res.status_code == 200
    
    # Test me endpoint
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email

def test_module_2_prompt_understanding():
    # Prompt from blueprint
    prompt = "Generate a professional advertisement image for a black sports shoe with a premium studio background."
    res = client.post("/api/agent/understand", json={"prompt": prompt})
    assert res.status_code == 200, res.text
    data = res.json()
    assert "black sports shoe" in data["subject"].lower() or "shoe" in data["subject"].lower()
    assert data["task"] in ["image_generation", "advertisement_creation"]
    assert "enhanced_prompt" in data
    assert data["aspect_ratio"] is not None

def test_module_3_agent_execution():
    prompt = "Generate a commercial advertisement for a luxury watch on black marble podium"
    res = client.post("/api/agent/execute", json={
        "prompt": prompt,
        "model_id": "flux-1-schnell",
        "aspect_ratio": "1:1"
    })
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["status"] == "completed"
    assert len(data["steps"]) >= 4
    assert data["media_url"].startswith("/static/generated/")
    assert data["latency"] > 0
    assert data["estimated_cost"] > 0

def test_module_4_generation():
    res = client.post("/api/generate", json={
        "prompt": "Futuristic electric supercar speeding through neon city at night",
        "model_id": "flux-1-schnell",
        "aspect_ratio": "16:9",
        "style": "cinematic studio"
    })
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["aspect_ratio"] == "16:9"
    assert data["media_url"] is not None

def test_module_5_editing():
    # Generate an image first
    gen_res = client.post("/api/generate", json={
        "prompt": "Red sneaker on white background",
        "aspect_ratio": "1:1"
    })
    img_url = gen_res.json()["media_url"]
    
    # Test Background Removal
    rem_res = client.post("/api/edit/remove-bg", json={"image_url": img_url})
    assert rem_res.status_code == 200, rem_res.text
    assert rem_res.json()["media_url"].endswith(".png")
    
    # Test Background Replacement
    rep_res = client.post("/api/edit/replace-bg", json={
        "image_url": rem_res.json()["media_url"],
        "preset_name": "neon_cyberpunk"
    })
    assert rep_res.status_code == 200
    
    # Test Adjustments
    adj_res = client.post("/api/edit/adjust", json={
        "image_url": rep_res.json()["media_url"],
        "brightness": 1.2,
        "contrast": 1.1,
        "saturation": 1.3,
        "sharpness": 1.5,
        "vignette": 0.2,
        "temperature": 15.0
    })
    assert adj_res.status_code == 200
    
    # Test Text Overlay
    txt_res = client.post("/api/edit/overlay", json={
        "image_url": adj_res.json()["media_url"],
        "headline_text": "LIMITED EDITION",
        "sub_text": "50% OFF TODAY ONLY",
        "badge_text": "SPECIAL OFFER",
        "position": "bottom",
        "accent_color": "#6366f1"
    })
    assert txt_res.status_code == 200

def test_module_6_model_comparison():
    # List models
    list_res = client.get("/api/models")
    assert list_res.status_code == 200
    models = list_res.json()["models"]
    assert len(models) >= 4
    
    # Compare models
    comp_res = client.post("/api/models/compare", json={
        "prompt": "Luxury perfume bottle with golden sparkles",
        "model_ids": ["flux-1-schnell", "sd-3.5-large"],
        "aspect_ratio": "1:1"
    })
    assert comp_res.status_code == 200, comp_res.text
    results = comp_res.json()["results"]
    assert len(results) == 2
    assert results[0]["latency"] > 0
    assert results[0]["estimated_cost"] > 0

def test_module_7_templates():
    # List templates
    tpl_res = client.get("/api/templates")
    assert tpl_res.status_code == 200
    templates = tpl_res.json()["templates"]
    assert len(templates) >= 6
    
    # Use template
    use_res = client.post("/api/templates/use", json={
        "template_id": "tpl_ecommerce_spotlight",
        "product_name": "Nike Air Zoom Max",
        "headline": "SPEED REDEFINED",
        "badge_text": "30% OFF"
    })
    assert use_res.status_code == 200, use_res.text
    data = use_res.json()
    assert data["media_url"] is not None

def test_module_8_media_and_projects():
    # Create project
    proj_res = client.post("/api/projects", json={
        "project_name": "Summer Sneaker Launch 2026",
        "description": "Commercial advertisement assets"
    })
    assert proj_res.status_code == 200
    proj_id = proj_res.json()["project_id"]
    
    # List media
    media_res = client.get("/api/media")
    assert media_res.status_code == 200
    assert "media" in media_res.json()

def test_module_10_analytics():
    res = client.get("/api/analytics/overview")
    assert res.status_code == 200, res.text
    data = res.json()
    assert "total_users" in data
    assert "total_generations" in data
    assert "total_expenditure_usd" in data
    assert "avg_latency_sec" in data
    assert "model_usage_breakdown" in data
    assert "daily_trend" in data
