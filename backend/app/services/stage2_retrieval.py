import uuid
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from backend.app.config import settings
from backend.app.models.repository import Repository

class Stage2RetrievalService:
    @staticmethod
    def get_authorized_candidate_set(tenant_id: str, role: str, authorized_scope: str,
                                     security_mode: str = "ON") -> List[Dict[str, Any]]:
        """
        Builds the candidate set strictly BEFORE similarity search.
        In Security ON mode: Only chunks belonging to tenant_id and with trust_state == 'allowed' are included.
        In Security OFF mode: Bypasses trust_state filter to demonstrate unsafe baseline.
        """
        if security_mode.upper() == "ON":
            # ONLY ALLOWED chunks within this tenant
            candidates = Repository.get_all_chunks(tenant_id=tenant_id, trust_states=["allowed"])
        else:
            # Security OFF: includes pending, quarantined, etc. (unsafe baseline)
            candidates = Repository.get_all_chunks(tenant_id=tenant_id, trust_states=None)
            
        return candidates

    @classmethod
    def search(cls, query: str, tenant_id: str, user_id: str = "user_default",
               role: str = "employee", authorized_scope: str = "default",
               security_mode: str = "ON", top_k: int = 4) -> Dict[str, Any]:
        """
        Executes authorization-scoped retrieval.
        """
        request_id = f"req_{uuid.uuid4().hex[:8]}"
        
        # 1. Build authorized candidate set strictly before search
        candidate_chunks = cls.get_authorized_candidate_set(
            tenant_id=tenant_id,
            role=role,
            authorized_scope=authorized_scope,
            security_mode=security_mode
        )
        candidate_ids = [c["chunk_id"] for c in candidate_chunks]
        
        # If candidate set is empty, return explicit insufficient-authorized-context
        if not candidate_chunks:
            Repository.record_retrieval_trace(
                request_id=request_id,
                user_id=user_id,
                tenant_id=tenant_id,
                authorized_scope=authorized_scope,
                query=query,
                candidate_chunk_ids=[],
                retrieved_chunk_ids=[],
                similarity_scores={}
            )
            return {
                "request_id": request_id,
                "status": "INSUFFICIENT_AUTHORIZED_CONTEXT",
                "message": "No authorized candidate chunks available for this tenant and scope.",
                "candidate_chunk_ids": [],
                "retrieved_chunks": [],
                "similarity_scores": {}
            }

        # 2. Similarity search only within the candidate set
        chunk_texts = [c["content"] for c in candidate_chunks]
        all_corpus = [query] + chunk_texts
        
        try:
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform(all_corpus)
            
            query_vec = tfidf_matrix[0:1]
            chunk_vecs = tfidf_matrix[1:]
            sim_scores = cosine_similarity(query_vec, chunk_vecs)[0]
        except Exception:
            # Fallback simple word overlap if TF-IDF fails on strange characters
            sim_scores = np.zeros(len(chunk_texts))
            q_words = set(query.lower().split())
            for i, text in enumerate(chunk_texts):
                c_words = set(text.lower().split())
                overlap = len(q_words.intersection(c_words))
                sim_scores[i] = overlap / max(1, len(q_words))

        # Rank and filter by similarity threshold
        ranked_indices = np.argsort(sim_scores)[::-1]
        
        retrieved_chunks = []
        similarity_map = {}
        threshold = settings.SIMILARITY_THRESHOLD if security_mode.upper() == "ON" else 0.05
        
        for idx in ranked_indices:
            score = float(sim_scores[idx])
            chunk = candidate_chunks[idx]
            similarity_map[chunk["chunk_id"]] = round(score, 4)
            
            if score >= threshold and len(retrieved_chunks) < top_k:
                chunk_copy = dict(chunk)
                chunk_copy["similarity"] = round(score, 4)
                retrieved_chunks.append(chunk_copy)

        retrieved_ids = [c["chunk_id"] for c in retrieved_chunks]
        
        # Record retrieval trace for auditability
        Repository.record_retrieval_trace(
            request_id=request_id,
            user_id=user_id,
            tenant_id=tenant_id,
            authorized_scope=authorized_scope,
            query=query,
            candidate_chunk_ids=candidate_ids,
            retrieved_chunk_ids=retrieved_ids,
            similarity_scores=similarity_map
        )
        
        status = "SUCCESS" if retrieved_chunks else "INSUFFICIENT_AUTHORIZED_CONTEXT"
        message = "Retrieved authorized chunks successfully." if retrieved_chunks else "Insufficient similarity or evidence in authorized context."
        
        return {
            "request_id": request_id,
            "status": status,
            "message": message,
            "candidate_chunk_ids": candidate_ids,
            "retrieved_chunks": retrieved_chunks,
            "similarity_scores": similarity_map
        }

