from fastapi import APIRouter
from backend.app.models.repository import Repository
from backend.app.services.canary_service import CanaryService

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/summary")
def get_dashboard_summary():
    docs = Repository.list_documents()
    events = Repository.list_security_events(limit=10)
    all_chunks = Repository.get_all_chunks()
    
    state_counts = {
        "allowed": 0,
        "quarantined": 0,
        "blocked": 0,
        "pending": 0,
        "demoted": 0
    }
    for d in docs:
        state = d.get("trust_state", "pending")
        state_counts[state] = state_counts.get(state, 0) + 1
        
    return {
        "total_documents": len(docs),
        "total_chunks": len(all_chunks),
        "total_security_events": len(Repository.list_security_events(limit=1000)),
        "trust_state_breakdown": state_counts,
        "recent_events": events,
        "pipeline_stages": {
            "stage_1_ingestion": "ACTIVE",
            "stage_2_authorized_retrieval": "ACTIVE",
            "stage_3_output_inspection": "ACTIVE",
            "closed_loop_quarantine": "ACTIVE"
        }
    }

@router.get("/security-score")
def get_security_score():
    return CanaryService.calculate_prototype_security_score()

@router.get("/canary-test")
def run_canary():
    return CanaryService.run_canary_probe()

