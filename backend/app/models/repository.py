import json
import sqlite3
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from backend.app.database import get_db_connection, init_db

init_db()

class Repository:
    @staticmethod
    def create_document(document_id: str, tenant_id: str, filename: str, provenance: str = "upload",
                        trust_state: str = "pending", ingestion_score: float = 0.0,
                        content_preview: str = "", file_path: str = "") -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute("""
        INSERT INTO documents (document_id, tenant_id, filename, provenance, trust_state, ingestion_score, content_preview, file_path, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (document_id, tenant_id, filename, provenance, trust_state, ingestion_score, content_preview, file_path, now, now))
        conn.commit()
        conn.close()
        return Repository.get_document(document_id)

    @staticmethod
    def get_document(document_id: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM documents WHERE document_id = ?", (document_id,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        return dict(row)

    @staticmethod
    def list_documents(tenant_id: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        if tenant_id:
            cursor.execute("SELECT * FROM documents WHERE tenant_id = ? ORDER BY created_at DESC", (tenant_id,))
        else:
            cursor.execute("SELECT * FROM documents ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def update_document_trust_state(document_id: str, trust_state: str, ingestion_score: Optional[float] = None) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        now = datetime.now(timezone.utc).isoformat()
        if ingestion_score is not None:
            cursor.execute("UPDATE documents SET trust_state = ?, ingestion_score = ?, updated_at = ? WHERE document_id = ?",
                           (trust_state, ingestion_score, now, document_id))
        else:
            cursor.execute("UPDATE documents SET trust_state = ?, updated_at = ? WHERE document_id = ?",
                           (trust_state, now, document_id))
        
        # Also cascade trust state update to all associated chunks
        cursor.execute("UPDATE chunks SET trust_state = ? WHERE document_id = ?", (trust_state, document_id))
        conn.commit()
        affected = cursor.rowcount
        conn.close()
        return affected > 0

    @staticmethod
    def create_chunk(chunk_id: str, document_id: str, tenant_id: str, content: str,
                     page_number: int = 1, section_title: str = "", risk_flags: List[str] = None,
                     trust_state: str = "pending", embedding: Optional[List[float]] = None) -> Dict[str, Any]:
        if risk_flags is None:
            risk_flags = []
        conn = get_db_connection()
        cursor = conn.cursor()
        now = datetime.now(timezone.utc).isoformat()
        emb_json = json.dumps(embedding) if embedding else None
        cursor.execute("""
        INSERT INTO chunks (chunk_id, document_id, tenant_id, content, embedding_json, page_number, section_title, risk_flags_json, trust_state, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (chunk_id, document_id, tenant_id, content, emb_json, page_number, section_title, json.dumps(risk_flags), trust_state, now))
        conn.commit()
        conn.close()
        return {
            "chunk_id": chunk_id, "document_id": document_id, "tenant_id": tenant_id,
            "content": content, "page_number": page_number, "section_title": section_title,
            "risk_flags": risk_flags, "trust_state": trust_state, "created_at": now
        }

    @staticmethod
    def get_chunks_for_document(document_id: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM chunks WHERE document_id = ? ORDER BY page_number, chunk_id", (document_id,))
        rows = cursor.fetchall()
        conn.close()
        results = []
        for r in rows:
            d = dict(r)
            d["risk_flags"] = json.loads(d.get("risk_flags_json") or "[]")
            results.append(d)
        return results

    @staticmethod
    def get_all_chunks(tenant_id: Optional[str] = None, trust_states: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT * FROM chunks WHERE 1=1"
        params = []
        if tenant_id:
            query += " AND tenant_id = ?"
            params.append(tenant_id)
        if trust_states:
            placeholders = ",".join(["?"] * len(trust_states))
            query += f" AND trust_state IN ({placeholders})"
            params.extend(trust_states)
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        results = []
        for r in rows:
            d = dict(r)
            d["risk_flags"] = json.loads(d.get("risk_flags_json") or "[]")
            if d.get("embedding_json"):
                d["embedding"] = json.loads(d["embedding_json"])
            results.append(d)
        return results

    @staticmethod
    def get_chunk(chunk_id: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM chunks WHERE chunk_id = ?", (chunk_id,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        d["risk_flags"] = json.loads(d.get("risk_flags_json") or "[]")
        return d

    @staticmethod
    def record_security_event(event_id: str, attack_type: str, evidence: str, action: str,
                              source_document_id: Optional[str] = None, source_chunk_id: Optional[str] = None,
                              request_id: Optional[str] = None) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute("""
        INSERT INTO security_events (event_id, attack_type, evidence, action, source_document_id, source_chunk_id, request_id, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (event_id, attack_type, evidence, action, source_document_id, source_chunk_id, request_id, now))
        conn.commit()
        conn.close()
        return {
            "event_id": event_id, "attack_type": attack_type, "evidence": evidence,
            "action": action, "source_document_id": source_document_id,
            "source_chunk_id": source_chunk_id, "request_id": request_id, "timestamp": now
        }

    @staticmethod
    def list_security_events(limit: int = 50) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM security_events ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def record_retrieval_trace(request_id: str, user_id: str, tenant_id: str, authorized_scope: str,
                               query: str, candidate_chunk_ids: List[str], retrieved_chunk_ids: List[str],
                               similarity_scores: Dict[str, float]) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute("""
        INSERT INTO retrieval_traces (request_id, user_id, tenant_id, authorized_scope, query, candidate_chunk_ids_json, retrieved_chunk_ids_json, similarity_json, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (request_id, user_id, tenant_id, authorized_scope, query, json.dumps(candidate_chunk_ids), json.dumps(retrieved_chunk_ids), json.dumps(similarity_scores), now))
        conn.commit()
        conn.close()
        return {
            "request_id": request_id, "user_id": user_id, "tenant_id": tenant_id,
            "authorized_scope": authorized_scope, "query": query,
            "authorized_candidate_ids": candidate_chunk_ids,
            "retrieved_chunk_ids": retrieved_chunk_ids,
            "similarity_scores": similarity_scores, "timestamp": now
        }

    @staticmethod
    def get_retrieval_trace(request_id: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM retrieval_traces WHERE request_id = ?", (request_id,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        d["authorized_candidate_ids"] = json.loads(d.get("candidate_chunk_ids_json") or "[]")
        d["retrieved_chunk_ids"] = json.loads(d.get("retrieved_chunk_ids_json") or "[]")
        d["similarity_scores"] = json.loads(d.get("similarity_json") or "{}")
        return d

    @staticmethod
    def record_claim(claim_id: str, request_id: str, claim_text: str,
                     supporting_chunk_ids: List[str], inspection_status: str, evidence: str = "") -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute("""
        INSERT INTO claims (claim_id, request_id, claim_text, supporting_chunk_ids_json, inspection_status, evidence, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (claim_id, request_id, claim_text, json.dumps(supporting_chunk_ids), inspection_status, evidence, now))
        conn.commit()
        conn.close()
        return {
            "claim_id": claim_id, "request_id": request_id, "claim_text": claim_text,
            "supporting_chunk_ids": supporting_chunk_ids, "inspection_status": inspection_status,
            "evidence": evidence, "timestamp": now
        }

    @staticmethod
    def reset_database():
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DROP TABLE IF EXISTS chunks")
        cursor.execute("DROP TABLE IF EXISTS documents")
        cursor.execute("DROP TABLE IF EXISTS users")
        cursor.execute("DROP TABLE IF EXISTS retrieval_traces")
        cursor.execute("DROP TABLE IF EXISTS claims")
        cursor.execute("DROP TABLE IF EXISTS security_events")
        cursor.execute("DROP TABLE IF EXISTS demo_runs")
        conn.commit()
        conn.close()
        init_db()
