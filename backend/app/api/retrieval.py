from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from backend.app.services.stage2_retrieval import Stage2RetrievalService
from backend.app.models.repository import Repository

router = APIRouter(prefix="/api/retrieval", tags=["retrieval"])

class SearchRequest(BaseModel):
    query: str
    tenant_id: str = "tenant_a"
    user_id: str = "tenantA_user"
    role: str = "analyst"
    authorized_scope: str = "internal_policy"
    security_mode: str = "ON"
    top_k: int = 4

@router.post("/search")
def search_authorized(req: SearchRequest):
    result = Stage2RetrievalService.search(
        query=req.query,
        tenant_id=req.tenant_id,
        user_id=req.user_id,
        role=req.role,
        authorized_scope=req.authorized_scope,
        security_mode=req.security_mode,
        top_k=req.top_k
    )
    return result

