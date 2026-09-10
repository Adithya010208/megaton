import uuid
from typing import Dict, Any, Optional
from backend.app.models.repository import Repository

class QuarantineEngine:
    """
    Closed-Loop Retroactive Quarantine Engine.
    The primary innovation: Traces detected malicious chunks back to their parent document,
    demoting/quarantining the source and excluding it from future retrieval.
    """
    
    @classmethod
    def execute_quarantine(cls, chunk_id: str, reason: str, attack_type: str = "RETROACTIVE_POISON_DETECTED",
                           request_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Traces chunk_id -> document_id, marks document and all associated chunks as 'quarantined',
        and logs a SecurityEvent audit record.
        """
        chunk = Repository.get_chunk(chunk_id)
        if not chunk:
            return {"success": False, "error": f"Chunk {chunk_id} not found."}
            
        doc_id = chunk["document_id"]
        doc = Repository.get_document(doc_id)
        before_state = doc["trust_state"] if doc else "unknown"
        
        # 1. Update source document trust state to quarantined in SQLite
        after_state = "quarantined"
        Repository.update_document_trust_state(doc_id, after_state)
        
        # 2. Record auditable SecurityEvent
        event_id = f"evt_closedloop_{uuid.uuid4().hex[:8]}"
        evidence = f"Retroactive trace triggered from chunk [{chunk_id}]: {reason}. Source document [{doc['filename'] if doc else doc_id}] demoted from '{before_state}' to '{after_state}'."
        
        event = Repository.record_security_event(
            event_id=event_id,
            attack_type=attack_type,
            evidence=evidence,
            action="CLOSED_LOOP_QUARANTINE",
            source_document_id=doc_id,
            source_chunk_id=chunk_id,
            request_id=request_id
        )
        
        return {
            "success": True,
            "event_id": event_id,
            "source_document_id": doc_id,
            "source_chunk_id": chunk_id,
            "document_filename": doc["filename"] if doc else "Unknown",
            "before_trust_state": before_state,
            "after_trust_state": after_state,
            "evidence": evidence,
            "action": "CLOSED_LOOP_QUARANTINE"
        }

    @classmethod
    def restore_document(cls, document_id: str) -> Dict[str, Any]:
        """
        Manually restores a quarantined document back to 'allowed' for demo rehearsal.
        """
        doc = Repository.get_document(document_id)
        if not doc:
            return {"success": False, "error": f"Document {document_id} not found."}
            
        before = doc["trust_state"]
        Repository.update_document_trust_state(document_id, "allowed")
        
        event_id = f"evt_restore_{uuid.uuid4().hex[:8]}"
        Repository.record_security_event(
            event_id=event_id,
            attack_type="ADMIN_OVERRIDE_RESTORE",
            evidence=f"Admin restored document [{doc['filename']}] to 'allowed'.",
            action="RESTORE_ALLOWED",
            source_document_id=document_id
        )
        
        return {
            "success": True,
            "document_id": document_id,
            "before_trust_state": before,
            "after_trust_state": "allowed"
        }

