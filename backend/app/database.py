import sqlite3
import os
import json
from typing import Optional, List, Dict, Any
from pathlib import Path

if os.getenv("VERCEL"):
    DB_PATH = Path("/tmp/data/megaton_shield.db")
elif os.getenv("DATABASE_PATH"):
    DB_PATH = Path(os.getenv("DATABASE_PATH"))
else:
    DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "megaton_shield.db"

def get_db_connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Documents table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        document_id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        provenance TEXT,
        trust_state TEXT NOT NULL DEFAULT 'pending',
        ingestion_score REAL DEFAULT 0.0,
        content_preview TEXT,
        file_path TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # Chunks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chunks (
        chunk_id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding_json TEXT,
        page_number INTEGER DEFAULT 1,
        section_title TEXT DEFAULT '',
        risk_flags_json TEXT DEFAULT '[]',
        trust_state TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE
    )
    """)

    # Users / Tenants table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        role TEXT NOT NULL,
        authorized_scope TEXT NOT NULL
    )
    """)

    # Retrieval traces table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS retrieval_traces (
        request_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        authorized_scope TEXT NOT NULL,
        query TEXT NOT NULL,
        candidate_chunk_ids_json TEXT NOT NULL,
        retrieved_chunk_ids_json TEXT NOT NULL,
        similarity_json TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)

    # Claims table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS claims (
        claim_id TEXT PRIMARY KEY,
        request_id TEXT NOT NULL,
        claim_text TEXT NOT NULL,
        supporting_chunk_ids_json TEXT NOT NULL,
        inspection_status TEXT NOT NULL,
        evidence TEXT,
        timestamp TEXT NOT NULL
    )
    """)

    # Security Events table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS security_events (
        event_id TEXT PRIMARY KEY,
        attack_type TEXT NOT NULL,
        evidence TEXT NOT NULL,
        action TEXT NOT NULL,
        source_document_id TEXT,
        source_chunk_id TEXT,
        request_id TEXT,
        timestamp TEXT NOT NULL
    )
    """)

    # Demo Runs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS demo_runs (
        run_id TEXT PRIMARY KEY,
        mode TEXT NOT NULL,
        attack_id TEXT NOT NULL,
        stage_results_json TEXT NOT NULL,
        final_outcome TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized at", DB_PATH)

