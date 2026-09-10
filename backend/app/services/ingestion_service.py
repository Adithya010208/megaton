import os
import uuid
import re
from typing import List, Dict, Any, Tuple
from pathlib import Path
from pypdf import PdfReader
from backend.app.models.repository import Repository

class IngestionService:
    @staticmethod
    def extract_text_from_file(file_path: str, filename: str) -> List[Tuple[int, str]]:
        """
        Extracts text from file. Returns a list of (page_number, text).
        """
        lower_name = filename.lower()
        pages: List[Tuple[int, str]] = []
        
        if lower_name.endswith(".pdf"):
            try:
                reader = PdfReader(file_path)
                for i, page in enumerate(reader.pages):
                    text = page.extract_text() or ""
                    pages.append((i + 1, text))
            except Exception as e:
                # Fallback in case of PDF parse issue
                pages.append((1, f"[PDF Extraction Error: {str(e)}]"))
        else:
            # Plain text, markdown, etc.
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                pages.append((1, content))
            except Exception as e:
                pages.append((1, f"[File Read Error: {str(e)}]"))
        
        return pages

    @staticmethod
    def chunk_text(pages: List[Tuple[int, str]], chunk_size: int = 400, overlap: int = 50) -> List[Dict[str, Any]]:
        """
        Splits text into chunks preserving page metadata and section headings.
        """
        chunks = []
        chunk_idx = 0
        
        for page_num, page_text in pages:
            # Clean text
            clean_text = re.sub(r'\r\n', '\n', page_text).strip()
            if not clean_text:
                continue
            
            # Paragraph-based or window-based splitting
            paragraphs = clean_text.split('\n\n')
            current_chunk = ""
            current_section = ""
            
            for p in paragraphs:
                p_trimmed = p.strip()
                if not p_trimmed:
                    continue
                
                # Check for markdown heading or title
                if p_trimmed.startswith("#") or (len(p_trimmed) < 60 and p_trimmed.isupper()):
                    current_section = p_trimmed.lstrip("#").strip()
                
                if len(current_chunk) + len(p_trimmed) <= chunk_size:
                    current_chunk = f"{current_chunk}\n\n{p_trimmed}".strip() if current_chunk else p_trimmed
                else:
                    if current_chunk:
                        chunk_idx += 1
                        chunks.append({
                            "chunk_index": chunk_idx,
                            "content": current_chunk,
                            "page_number": page_num,
                            "section_title": current_section or f"Page {page_num}"
                        })
                    current_chunk = p_trimmed
            
            if current_chunk:
                chunk_idx += 1
                chunks.append({
                    "chunk_index": chunk_idx,
                    "content": current_chunk,
                    "page_number": page_num,
                    "section_title": current_section or f"Page {page_num}"
                })
        
        # If no chunks produced (e.g. empty file)
        if not chunks:
            chunks.append({
                "chunk_index": 1,
                "content": "[Empty document content]",
                "page_number": 1,
                "section_title": "Empty"
            })
            
        return chunks

    @staticmethod
    def ingest_document(tenant_id: str, filename: str, file_path: str,
                        provenance: str = "upload", initial_trust: str = "pending") -> Dict[str, Any]:
        """
        Ingests a document: extracts text, chunks it, and saves document + chunks to repository.
        """
        doc_id = f"doc_{uuid.uuid4().hex[:8]}"
        pages = IngestionService.extract_text_from_file(file_path, filename)
        raw_chunks = IngestionService.chunk_text(pages)
        
        # Generate content preview
        preview = (pages[0][1][:250] + "...") if pages and pages[0][1] else filename
        
        # Save document record
        doc = Repository.create_document(
            document_id=doc_id,
            tenant_id=tenant_id,
            filename=filename,
            provenance=provenance,
            trust_state=initial_trust,
            ingestion_score=0.0,
            content_preview=preview,
            file_path=file_path
        )
        
        created_chunks = []
        for c in raw_chunks:
            chunk_id = f"{doc_id}_c{c['chunk_index']}"
            saved_chunk = Repository.create_chunk(
                chunk_id=chunk_id,
                document_id=doc_id,
                tenant_id=tenant_id,
                content=c["content"],
                page_number=c["page_number"],
                section_title=c["section_title"],
                risk_flags=[],
                trust_state=initial_trust
            )
            created_chunks.append(saved_chunk)
        
        return {
            "document": doc,
            "chunks_count": len(created_chunks),
            "chunks": created_chunks
        }

