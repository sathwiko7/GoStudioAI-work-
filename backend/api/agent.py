from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.api.auth import get_current_user
from backend.models.db_models import User
from backend.models.schemas import (
    StructuredTaskPlan,
    AgentExecuteRequest,
    AgentExecuteResponse
)
from backend.services.llm_service import understand_user_prompt
from backend.services.agent_service import execute_agent_workflow

router = APIRouter(prefix="/agent", tags=["Intelligent AI Agent"])

@router.post("/understand", response_model=StructuredTaskPlan)
async def analyze_prompt(payload: dict):
    """
    Module 2: AI Prompt Understanding.
    Transforms natural-language user prompt into a structured JSON execution plan.
    """
    prompt = payload.get("prompt", "").strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    plan = await understand_user_prompt(prompt)
    return plan

@router.post("/execute", response_model=AgentExecuteResponse)
async def run_agent(
    request: AgentExecuteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Module 3: Intelligent AI Agent Workflow.
    Decides the optimal tool, executes the pipeline, records latency and cost,
    and returns full step-by-step observable thought trace.
    """
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        
    result = await execute_agent_workflow(
        request=request,
        user_id=current_user.user_id,
        db=db
    )
    return result
