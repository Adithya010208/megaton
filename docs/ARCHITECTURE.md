# Architecture Specification: Three-Stage RAG Integrity Shield

## 1. System Overview
The **Three-Stage RAG Integrity Shield** is an end-to-end security architecture designed to prevent, detect, explain, and contain indirect prompt injection and knowledge base poisoning attacks against Retrieval-Augmented Generation (RAG) systems.

```
[Document Upload] 
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 1: SECURE INGESTION                              │
│ • Heuristic / Regex AI Directive Injection Detector   │
│ • Domain-Fit & Statistical Lexical Stuffing Scorer     │
│ • Policy Gate: ALLOW / QUARANTINE / BLOCK              │
└───────────────────────┬────────────────────────────────┘
                        │ Allowed Chunks
                        ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 2: AUTHORIZATION-SCORED RETRIEVAL               │
│ • Pre-Similarity Candidate Set: (Tenant, Role, Scope)  │
│ • Zero Post-Filtering Fallback                         │
│ • Cosine Similarity Vector Search on Scoped Pool       │
└───────────────────────┬────────────────────────────────┘
                        │ Authorized Candidates
                        ▼
┌────────────────────────────────────────────────────────┐
│ RAG GENERATION                                         │
│ • LLM Prompt: Untrusted Context Rules + Chunk ID Cites │
│ • Dual Mode: Hosted Providers + Deterministic Mock     │
└───────────────────────┬────────────────────────────────┘
                        │ Generated Output
                        ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 3: OUTPUT INSPECTION                             │
│ • Instruction Echo Detector                            │
│ • Unsolicited Outbound / Phishing URL Interceptor      │
│ • Claim-to-Chunk Prototype Grounding Engine            │
└───────────────────────┬────────────────────────────────┘
                        │
       ┌────────────────┴────────────────┐
       ▼                                 ▼
   [SAFE OUTPUT]            [MALICIOUS SIGNAL DETECTED]
                                         │
                                         ▼
                 ┌───────────────────────────────────────┐
                 │ CLOSED-LOOP RETROACTIVE QUARANTINE    │
                 │ 1. Resolve chunk_id ➔ source_doc_id   │
                 │ 2. Update SQLite trust_state ➔ demoted│
                 │ 3. Log auditable SecurityEvent        │
                 │ 4. Exclude source from all future     │
                 │    retrieval candidate sets           │
                 └───────────────────────────────────────┘
```

## 2. Core Entities
1. **Document**: `document_id`, `tenant_id`, `filename`, `provenance`, `trust_state` (`allowed`, `quarantined`, `blocked`, `demoted`), `ingestion_score`.
2. **Chunk**: `chunk_id`, `document_id`, `tenant_id`, `content`, `page_number`, `section_title`, `risk_flags`, `trust_state`.
3. **Retrieval Trace**: `request_id`, `user_id`, `tenant_id`, `authorized_scope`, `candidate_chunk_ids`, `retrieved_chunk_ids`, `similarity_scores`.
4. **Claim**: `claim_id`, `request_id`, `claim_text`, `supporting_chunk_ids`, `inspection_status`.
5. **Security Event**: `event_id`, `attack_type`, `evidence`, `action`, `source_document_id`, `source_chunk_id`, `timestamp`.

