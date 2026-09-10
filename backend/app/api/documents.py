import os
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List
from backend.app.models.repository import Repository
from backend.app.services.ingestion_service import IngestionService
from backend.app.services.stage1_scanner import Stage1Scanner

router = APIRouter(prefix="/api/documents", tags=["documents"])

if os.getenv("VERCEL"):
    UPLOAD_DIR = Path("/tmp/uploads")
else:
    UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    tenant_id: str = Form("tenant_a"),
    provenance: str = Form("user_upload"),
    auto_scan: bool = Form(True)
):
    safe_filename = file.filename.replace(" ", "_")
    target_path = UPLOAD_DIR / safe_filename
    
    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Ingest document and create chunks
    ingest_result = IngestionService.ingest_document(
        tenant_id=tenant_id,
        filename=safe_filename,
        file_path=str(target_path),
        provenance=provenance,
        initial_trust="pending"
    )
    
    doc_id = ingest_result["document"]["document_id"]
    
    scan_result = None
    if auto_scan:
        scan_result = Stage1Scanner.scan_document(doc_id)
        
    doc = Repository.get_document(doc_id)
    chunks = Repository.get_chunks_for_document(doc_id)
    
    return {
        "status": "success",
        "document": doc,
        "chunks_count": len(chunks),
        "stage1_scan": scan_result
    }

@router.get("")
def list_documents(tenant_id: Optional[str] = None):
    docs = Repository.list_documents(tenant_id=tenant_id)
    return {"documents": docs, "total": len(docs)}

@router.get("/{document_id}")
def get_document(document_id: str):
    doc = Repository.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    chunks = Repository.get_chunks_for_document(document_id)
    return {
        "document": doc,
        "chunks": chunks,
        "total_chunks": len(chunks)
    }

@router.post("/{document_id}/rescan")
def rescan_document(document_id: str):
    doc = Repository.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    scan_result = Stage1Scanner.scan_document(document_id)
    updated_doc = Repository.get_document(document_id)
    return {
        "status": "success",
        "document": updated_doc,
        "stage1_scan": scan_result
    }

