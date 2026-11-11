import os
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ["SKIP_ONLINE_FETCH"] = "true"

from fastapi.testclient import TestClient
from backend.main import app

def main():
    print("Initializing test client...", flush=True)
    client = TestClient(app)
    print("Test client initialized!", flush=True)
    
    print("1. Testing Models Registry...")
    res = client.get("/api/models")
    assert res.status_code == 200, res.text
    models = res.json()["models"]
    print(f"   -> Loaded {len(models)} models successfully!")

    print("2. Testing Prompt Understanding (Module 2)...")
    res = client.post("/api/agent/understand", json={
        "prompt": "Generate a professional advertisement image for a black sports shoe with a premium studio background."
    })
    assert res.status_code == 200, res.text
    plan = res.json()
    print(f"   -> Task: {plan['task']}, Subject: {plan['subject']}, Style: {plan['style']}")

    print("3. Testing Intelligent Agent Workflow (Module 3)...")
    res = client.post("/api/agent/execute", json={
        "prompt": "Create an advertisement for a black sports shoe",
        "model_id": "flux-1-schnell",
        "aspect_ratio": "1:1"
    })
    assert res.status_code == 200, res.text
    agent_res = res.json()
    print(f"   -> Status: {agent_res['status']}, Tool: {agent_res['tool_selected']}, Latency: {agent_res['latency']}s, Cost: ${agent_res['estimated_cost']}")

    print("4. Testing AI Image Editing & Background Replacement (Module 5)...")
    img_url = agent_res["media_url"]
    rem_res = client.post("/api/edit/remove-bg", json={"image_url": img_url})
    assert rem_res.status_code == 200, rem_res.text
    print(f"   -> Background removed: {rem_res.json()['media_url']}")
    
    rep_res = client.post("/api/edit/replace-bg", json={
        "image_url": rem_res.json()["media_url"],
        "preset_name": "neon_cyberpunk"
    })
    assert rep_res.status_code == 200, rep_res.text
    print(f"   -> Replaced background with neon_cyberpunk: {rep_res.json()['media_url']}")

    print("5. Testing Creative Templates (Module 7)...")
    tpl_res = client.get("/api/templates")
    assert tpl_res.status_code == 200
    tpls = tpl_res.json()["templates"]
    print(f"   -> Loaded {len(tpls)} creative templates!")

    print("6. Testing Admin Analytics (Module 10)...")
    ana_res = client.get("/api/analytics/overview")
    assert ana_res.status_code == 200
    ana = ana_res.json()
    print(f"   -> Total Generations: {ana['total_generations']}, Total Cost: ${ana['total_expenditure_usd']}, SLA Latency: {ana['avg_latency_sec']}s")

    print("\nALL SMOKE TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    main()
