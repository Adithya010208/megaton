from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class TrustState(str, Enum):
    PENDING = "pending"
    ALLOWED = "allowed"
    QUARANTINED = "quarantined"
    BLOCKED = "blocked"
    DEMOTED = "demoted"

class SecurityAction(str, Enum):
    ALLOW = "ALLOW"
    QUARANTINE = "QUARANTINE"
    BLOCK = "BLOCK"
    DEMOTE = "DEMOTE"
    REVIEW = "REVIEW"
    SAFE = "SAFE"
    REFUSE = "REFUSE"

class DocumentModel(BaseModel):
    document_id: str
    tenant_id: str
    filename: str
    provenance: str = "upload"
    trust_state: TrustState = TrustState.PENDING
    ingestion_score: float = 0.0
    content_preview: Optional[str] = ""
    created_at: str
    updated_at: str

class ChunkModel(BaseModel):
    chunk_id: str
    document_id: str
    tenant_id: str
    content: str
    page_number: int = 1
    section_title: str = ""
    risk_flags: List[str] = Field(default_factory=list)
    trust_state: TrustState = TrustState.PENDING
    created_at: str

class SecurityEventModel(BaseModel):
    event_id: str
    attack_type: str
    evidence: str
    action: str
    source_document_id: Optional[str] = None
    source_chunk_id: Optional[str] = None
    request_id: Optional[str] = None
    timestamp: str

class ClaimModel(BaseModel):
    claim_id: str
    request_id: str
    claim_text: str
    supporting_chunk_ids: List[str] = Field(default_factory=list)
    inspection_status: str  # e.g., 'SUPPORTED', 'UNSUPPORTED', 'SUSPICIOUS_ECHO'
    evidence: Optional[str] = None
    timestamp: str

class RetrievalTraceModel(BaseModel):
    request_id: str
    user_id: str
    tenant_id: str
    authorized_scope: str
    query: str
    authorized_candidate_ids: List[str] = Field(default_factory=list)
    retrieved_chunk_ids: List[str] = Field(default_factory=list)
    similarity_scores: Dict[str, float] = Field(default_factory=dict)
    timestamp: str

class UserContext(BaseModel):
    user_id: str
    tenant_id: str
    role: str
    authorized_scope: str

class RAGQueryRequest(BaseModel):
    query: str
    user_id: str = "tenantA_user"
    tenant_id: str = "tenant_a"
    role: str = "analyst"
    authorized_scope: str = "internal_policy"
    security_mode: str = "ON"  # "ON" or "OFF"
    top_k: int = 4

class RAGQueryResponse(BaseModel):
    request_id: str
    query: str
    answer: str
    status: str  # "SUCCESS", "INSUFFICIENT_CONTEXT", "BLOCKED", "QUARANTINED"
    security_mode: str
    retrieved_chunks: List[Dict[str, Any]] = Field(default_factory=list)
    candidate_chunk_ids: List[str] = Field(default_factory=list)
    claims: List[ClaimModel] = Field(default_factory=list)
    security_events: List[SecurityEventModel] = Field(default_factory=list)
    inspection_result: Dict[str, Any] = Field(default_factory=dict)

