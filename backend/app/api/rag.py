from fastapi import APIRouter, HTTPException
from backend.app.schemas.models import RAGQueryRequest
from backend.app.services.rag_service import RAGPipelineService
from backend.app.models.repository import Repository

router = APIRouter(prefix="/api/rag", tags=["rag"])

@router.post("/query")
def query_rag(req: RAGQueryRequest):
    result = RAGPipelineService.process_query(req)
    return result

@router.get("/trace/{request_id}")
def get_retrieval_trace(request_id: str):
    trace = Repository.get_retrieval_trace(request_id)
    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")
    return trace

@router.get("/requests/{request_id}/trace")
def get_request_trace(request_id: str):
    trace = Repository.get_retrieval_trace(request_id)
    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")
    return trace

