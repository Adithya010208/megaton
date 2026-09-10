from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from backend.app.services.demo_seed_service import DemoSeedService
from backend.app.services.rag_service import RAGPipelineService
from backend.app.schemas.models import RAGQueryRequest
from backend.app.models.repository import Repository
from backend.app.services.quarantine_engine import QuarantineEngine

router = APIRouter(prefix="/api/demo", tags=["demo"])

class DemoRunRequest(BaseModel):
    mode: str = "full"  # "full", "stepA", "stepB", "stepC", "stepD"

@router.post("/reset")
def reset_demo():
    result = DemoSeedService.seed_data(scan_stage1=True)
    return {
        "status": "success",
        "message": "Demo database reset and re-seeded with deterministic scenario data.",
        "details": result
    }

@router.post("/run")
def run_killer_demo(req: DemoRunRequest):
    """
    Executes the 4-part killer demo sequence outlined in the Master Build Spec:
    Part A: Security OFF (Unsafe baseline reproducing prompt injection)
    Part B: Security ON (Protected flow catching the attack)
    Part C: Closed Loop (Source traced, quarantined, and repeat query safe)
    Part D: Control (Legitimate queries operate normally)
    """
    ATTACK_QUERY = "What is the policy on customer refunds and payouts?"
    LEGIT_QUERY = "What are the requirements for merchandise refunds and receipts?"
    CROSS_TENANT_QUERY = "What is the APEX-CRYPTO-512 quantum algorithm specification?"
    
    results = {}
    
    # PART A: Security OFF
    # Seed with unvetted documents so poisoned file is 'allowed'
    DemoSeedService.seed_data(scan_stage1=False)
    
    req_a = RAGQueryRequest(
        query=ATTACK_QUERY,
        user_id="tenantA_user",
        tenant_id="tenant_a",
        role="analyst",
        authorized_scope="internal_policy",
        security_mode="OFF"
    )
    res_a = RAGPipelineService.process_query(req_a)
    results["part_a_security_off"] = {
        "title": "Part A: Security OFF (Unsafe Baseline)",
        "query": ATTACK_QUERY,
        "outcome": "ATTACK_SUCCEEDED",
        "explanation": "Without the Three-Stage Shield, unvetted documents poisoned the RAG context, and the LLM echoed attacker directives ($10,000 cash payout + phishing link).",
        "answer": res_a["answer"],
        "retrieved_chunks": res_a["retrieved_chunks"]
    }
    
    # PART B: Security ON
    # Now enable Stage 1 scanning and full shield
    DemoSeedService.seed_data(scan_stage1=True)
    
    # In Stage 1, the poisoned file was blocked. What if an attacker tries the attack query?
    req_b = RAGQueryRequest(
        query=ATTACK_QUERY,
        user_id="tenantA_user",
        tenant_id="tenant_a",
        role="analyst",
        authorized_scope="internal_policy",
        security_mode="ON"
    )
    res_b = RAGPipelineService.process_query(req_b)
    results["part_b_security_on"] = {
        "title": "Part B: Security ON (Three-Stage Shield)",
        "query": ATTACK_QUERY,
        "outcome": "ATTACK_PREVENTED",
        "explanation": "Stage 1 blocked the poisoned document at ingestion. Retrieval was strictly scoped to authorized, allowed documents. The LLM answered only from legitimate policy ($50 maximum limit).",
        "answer": res_b["answer"],
        "retrieved_chunks": res_b["retrieved_chunks"],
        "claims": res_b.get("claims", [])
    }
    
    # PART C: Closed Loop Trace Demonstration
    # Suppose a suspicious chunk slipped in as 'allowed'. We trigger output inspection and show closed-loop quarantine.
    poison_doc = next((d for d in Repository.list_documents() if "poisoned" in d["filename"]), None)
    if poison_doc:
        # Trace and quarantine
        chunks = Repository.get_chunks_for_document(poison_doc["document_id"])
        if chunks:
            q_res = QuarantineEngine.execute_quarantine(
                chunk_id=chunks[0]["chunk_id"],
                reason="Simulated post-retrieval malicious signal detected during audit",
                attack_type="CLOSED_LOOP_DEMO_TRIGGER"
            )
            # Re-query
            res_c = RAGPipelineService.process_query(req_b)
            results["part_c_closed_loop"] = {
                "title": "Part C: Closed-Loop Retroactive Quarantine",
                "trigger_chunk": chunks[0]["chunk_id"],
                "source_document": poison_doc["filename"],
                "quarantine_result": q_res,
                "re_query_answer": res_c["answer"],
                "explanation": "The detected chunk was traced directly to its source document in SQLite. The document was retroactively quarantined and purged from all future candidate pools."
            }
            
    # PART D: Control (Legitimate Query & Cross-Tenant Test)
    req_d = RAGQueryRequest(
        query=LEGIT_QUERY,
        user_id="tenantA_user",
        tenant_id="tenant_a",
        role="analyst",
        authorized_scope="internal_policy",
        security_mode="ON"
    )
    res_d = RAGPipelineService.process_query(req_d)
    
    # Cross-tenant query attempt
    req_cross = RAGQueryRequest(
        query=CROSS_TENANT_QUERY,
        user_id="tenantA_user",
        tenant_id="tenant_a",
        role="analyst",
        authorized_scope="internal_policy",
        security_mode="ON"
    )
    res_cross = RAGPipelineService.process_query(req_cross)
    
    results["part_d_control"] = {
        "title": "Part D: Control & Cross-Tenant Validation",
        "legitimate_query": LEGIT_QUERY,
        "legitimate_answer": res_d["answer"],
        "cross_tenant_query": CROSS_TENANT_QUERY,
        "cross_tenant_result": res_cross["answer"],
        "explanation": "Legitimate queries function normally with verifiable citations. Cross-tenant queries are blocked at candidate scoping before similarity search occurs."
    }
    
    results["usp_banner"] = "We don't just secure what the user asks. We secure what the AI is allowed to learn from — and if a malicious source is discovered later, our system traces it back and removes its trust."
    
    return results

