import uuid
from typing import Dict, Any, List
from backend.app.schemas.models import RAGQueryRequest, RAGQueryResponse, ClaimModel, SecurityEventModel
from backend.app.services.stage2_retrieval import Stage2RetrievalService
from backend.app.services.llm_adapter import LLMAdapter
from backend.app.services.stage3_inspector import Stage3Inspector
from backend.app.services.quarantine_engine import QuarantineEngine
from backend.app.models.repository import Repository

class RAGPipelineService:
    @classmethod
    def process_query(cls, request: RAGQueryRequest) -> Dict[str, Any]:
        """
        Full end-to-end RAG pipeline executing Stage 2 -> Generation -> Stage 3 -> Closed Loop.
        Supports both Security ON (shield active) and Security OFF (vulnerable baseline).
        """
        mode = request.security_mode.upper()
        
        # 1. STAGE 2: Authorized-Scoped Retrieval (Authorization before similarity)
        retrieval_res = Stage2RetrievalService.search(
            query=request.query,
            tenant_id=request.tenant_id,
            user_id=request.user_id,
            role=request.role,
            authorized_scope=request.authorized_scope,
            security_mode=mode,
            top_k=request.top_k
        )
        
        request_id = retrieval_res["request_id"]
        retrieved_chunks = retrieval_res.get("retrieved_chunks", [])
        candidate_ids = retrieval_res.get("candidate_chunk_ids", [])
        
        # Check if insufficient authorized context
        if retrieval_res["status"] == "INSUFFICIENT_AUTHORIZED_CONTEXT" or not retrieved_chunks:
            return {
                "request_id": request_id,
                "query": request.query,
                "answer": "Authorized context is insufficient to answer this query. No authorized evidence was found in your scope.",
                "status": "INSUFFICIENT_CONTEXT",
                "security_mode": mode,
                "retrieved_chunks": [],
                "candidate_chunk_ids": candidate_ids,
                "claims": [],
                "security_events": [],
                "inspection_result": {
                    "status": "SAFE",
                    "evidence": "Safe refusal: No authorized data breached."
                }
            }

        # 2. RAG GENERATION (via LLM Adapter constrained to authorized chunks)
        gen_result = LLMAdapter.generate(
            query=request.query,
            retrieved_chunks=retrieved_chunks,
            security_mode=mode
        )
        raw_answer = gen_result["answer"]
        
        security_events_generated = []
        
        # 3. STAGE 3: Output Inspection & Claim-to-Evidence Grounding
        if mode == "ON":
            inspection = Stage3Inspector.inspect(raw_answer, retrieved_chunks, request_id)
            claims = inspection["claims"]
            
            final_status = "SUCCESS"
            delivered_answer = raw_answer
            
            # If inspection flags instruction echo or malicious payload
            if inspection["status"] == "BLOCK/REFUSE":
                final_status = "BLOCKED"
                delivered_answer = f"[SHIELD BLOCKED]: Generated output was intercepted by Stage 3 Output Inspector due to detected instruction echo / unauthorized exfiltration. Evidence: {inspection['evidence']}"
                
                # 4. CLOSED-LOOP RETROACTIVE QUARANTINE
                # The primary innovation: trace malicious chunk -> source document -> quarantine!
                malicious_chunks = inspection.get("malicious_chunk_ids", [])
                for m_chunk_id in malicious_chunks:
                    q_res = QuarantineEngine.execute_quarantine(
                        chunk_id=m_chunk_id,
                        reason=f"Stage 3 detected malicious echo in output: {inspection['evidence']}",
                        attack_type="OUTPUT_INSPECTION_ECHO",
                        request_id=request_id
                    )
                    security_events_generated.append(q_res)
            elif inspection["status"] == "REVIEW":
                final_status = "REVIEW"
                delivered_answer = f"{raw_answer}\n\n[NOTICE]: Some statements in this response lack direct ground truth citations in authorized knowledge chunks."

            return {
                "request_id": request_id,
                "query": request.query,
                "answer": delivered_answer,
                "status": final_status,
                "security_mode": mode,
                "retrieved_chunks": retrieved_chunks,
                "candidate_chunk_ids": candidate_ids,
                "claims": claims,
                "security_events": security_events_generated,
                "inspection_result": inspection
            }
        else:
            # Security OFF: Baseline mode (No output inspection, no closed loop)
            return {
                "request_id": request_id,
                "query": request.query,
                "answer": raw_answer,
                "status": "UNPROTECTED_BASELINE",
                "security_mode": "OFF",
                "retrieved_chunks": retrieved_chunks,
                "candidate_chunk_ids": candidate_ids,
                "claims": [],
                "security_events": [],
                "inspection_result": {
                    "status": "BYPASSED",
                    "evidence": "Security OFF baseline: Stage 1, Stage 2 authorization filter, and Stage 3 inspection disabled."
                }
            }

