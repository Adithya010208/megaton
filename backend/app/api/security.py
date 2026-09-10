from fastapi import APIRouter, HTTPException
from typing import Optional
from backend.app.models.repository import Repository
from backend.app.services.quarantine_engine import QuarantineEngine

router = APIRouter(prefix="/api/security", tags=["security"])

@router.get("/events")
def list_events(limit: int = 50):
    events = Repository.list_security_events(limit=limit)
    return {"events": events, "total": len(events)}

@router.get("/events/{event_id}")
def get_event(event_id: str):
    conn = Repository.create_chunk.__globals__["get_db_connection"]()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM security_events WHERE event_id = ?", (event_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Security event not found")
    return dict(row)

@router.post("/quarantine/{document_id}")
def manual_quarantine(document_id: str):
    doc = Repository.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    Repository.update_document_trust_state(document_id, "quarantined")
    event = Repository.record_security_event(
        event_id=f"evt_manual_{document_id[:8]}",
        attack_type="MANUAL_OPERATOR_QUARANTINE",
        evidence=f"Operator manually quarantined document {doc['filename']}",
        action="QUARANTINE",
        source_document_id=document_id
    )
    return {"status": "success", "trust_state": "quarantined", "event": event}

@router.post("/restore/{document_id}")
def restore_document(document_id: str):
    res = QuarantineEngine.restore_document(document_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("error"))
    return res

