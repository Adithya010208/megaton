import re
import uuid
import numpy as np
from typing import Dict, Any, List, Tuple
from backend.app.config import settings
from backend.app.models.repository import Repository

# Known instruction-injection patterns specifically targeted at AI systems
INJECTION_PATTERNS = [
    (r"(?i)\b(ignore|disregard|forget)\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|prompts|rules)", "OVERRIDE_PREVIOUS_INSTRUCTIONS", 0.95),
    (r"(?i)system\s*override\s*[:\-\]]", "SYSTEM_OVERRIDE_PREFIX", 0.98),
    (r"(?i)\[\s*(system|admin|ai)\s*(instruction|directive|command)\s*\]", "DELIMITED_SYSTEM_INSTRUCTION", 0.95),
    (r"(?i)\bwhen\s+asked\s+about\s+.*?\s+say\b", "OUTPUT_HIJACK_CONDITION", 0.85),
    (r"(?i)\byou\s+are\s+now\s+(an?\s+)?(unrestricted|jailbroken|dan|evil|bypass)", "ROLEPLAY_JAILBREAK", 0.90),
    (r"(?i)\b(exfiltrate|send|leak|forward)\s+(all\s+)?(credentials|passwords|keys|secrets|data)\s+to\s+https?://", "DATA_EXFILTRATION_PAYLOAD", 0.99),
    (r"(?i)important\s*update\s*:\s*the\s*new\s*policy\s+is\s+to\s+grant", "POLICY_SPOOFING_INJECTION", 0.85),
    (r"(?i)do\s+not\s+follow\s+standard\s+guidelines", "SAFETY_BYPASS_ATTEMPT", 0.80),
    (r"(?i)<\s*system\s*>.*?<\s*/\s*system\s*>", "XML_SYSTEM_TAG_INJECTION", 0.95),
    (r"(?i)\bpretend\s+that\s+you\s+have\s+no\s+rules\b", "PROMPT_INJECTION_SIMULATION", 0.88),
]

class Stage1Scanner:
    @staticmethod
    def detect_instruction_injection(text: str) -> Tuple[bool, List[str], List[str], float]:
        """
        Scans text for instruction injection patterns targeting AI assistants.
        Returns: (detected, matched_pattern_names, evidence_snippets, max_score)
        """
        matched_patterns = []
        evidence_snippets = []
        max_score = 0.0
        
        for pattern, name, score in INJECTION_PATTERNS:
            matches = list(re.finditer(pattern, text))
            if matches:
                matched_patterns.append(name)
                for m in matches[:2]:  # Grab first 2 matches as evidence
                    # Extract surrounding context
                    start = max(0, m.start() - 20)
                    end = min(len(text), m.end() + 40)
                    snippet = text[start:end].replace("\n", " ").strip()
                    evidence_snippets.append(f"[{name}]: ...{snippet}...")
                if score > max_score:
                    max_score = score
                    
        is_injected = len(matched_patterns) > 0 and max_score >= settings.INJECTION_SENSITIVITY
        return is_injected, matched_patterns, evidence_snippets, max_score

    @staticmethod
    def calculate_lexical_stuffing_score(text: str) -> Tuple[float, List[str]]:
        """
        Detects lexical stuffing, repetition, and abnormal character entropy.
        """
        if not text.strip():
            return 0.0, []
        
        flags = []
        words = re.findall(r'\b\w+\b', text.lower())
        if not words:
            return 0.0, []
        
        # Word repetition ratio (unique words vs total words)
        unique_words = set(words)
        uniqueness_ratio = len(unique_words) / len(words)
        
        # Punctuation / symbol ratio
        symbols = re.findall(r'[^a-zA-Z0-9\s]', text)
        symbol_ratio = len(symbols) / max(1, len(text))
        
        # Hidden / invisible Unicode characters (zero-width spaces, etc.)
        invisible_chars = re.findall(r'[\u200B-\u200D\uFEFF\u00A0]', text)
        
        score = 0.0
        if uniqueness_ratio < 0.25 and len(words) > 30:
            score += 0.4
            flags.append(f"High word repetition (uniqueness: {uniqueness_ratio:.2f})")
            
        if symbol_ratio > 0.30:
            score += 0.4
            flags.append(f"Abnormal symbol density ({symbol_ratio:.2f})")
            
        if invisible_chars:
            score += 0.5
            flags.append(f"Contains {len(invisible_chars)} hidden/invisible Unicode characters")
            
        return min(1.0, score), flags

    @staticmethod
    def calculate_domain_anomaly_score(text: str) -> Tuple[float, List[str]]:
        """
        Evaluates domain fit against corporate policy/knowledge patterns.
        Heuristics check for prompt injection keywords, strange imperative density, or foreign payloads.
        """
        flags = []
        lower = text.lower()
        
        # High density of prompt manipulation vocabulary
        manipulation_words = ["override", "ignore", "bypass", "jailbreak", "exfiltrate", "admin", "privilege", "unrestricted", "system_prompt"]
        found_manipulation = [w for w in manipulation_words if w in lower]
        
        score = 0.0
        if len(found_manipulation) >= 3:
            score += 0.6
            flags.append(f"Suspicious prompt control keywords present: {', '.join(found_manipulation)}")
        elif len(found_manipulation) >= 1:
            score += 0.25
            flags.append(f"Uncommon control keyword: {found_manipulation[0]}")
            
        return min(1.0, score), flags

    @classmethod
    def scan_document(cls, document_id: str) -> Dict[str, Any]:
        """
        Executes Stage 1 security inspection on a document and its chunks.
        Determines whether document is ALLOWED, QUARANTINED, or BLOCKED.
        """
        doc = Repository.get_document(document_id)
        if not doc:
            raise ValueError(f"Document {document_id} not found")
            
        chunks = Repository.get_chunks_for_document(document_id)
        
        all_injection_detected = False
        all_evidence = []
        all_risk_flags = []
        max_injection_score = 0.0
        max_stuffing_score = 0.0
        max_anomaly_score = 0.0
        
        for chunk in chunks:
            content = chunk["content"]
            chunk_risk_flags = []
            
            # 1. Injection detection
            injected, matched_patterns, snippets, inj_score = cls.detect_instruction_injection(content)
            if inj_score > max_injection_score:
                max_injection_score = inj_score
            if injected:
                all_injection_detected = True
                chunk_risk_flags.extend(matched_patterns)
                all_evidence.extend(snippets)
                
            # 2. Stuffing detection
            stuff_score, stuff_flags = cls.calculate_lexical_stuffing_score(content)
            if stuff_score > max_stuffing_score:
                max_stuffing_score = stuff_score
            chunk_risk_flags.extend(stuff_flags)
            
            # 3. Domain anomaly detection
            anomaly_score, anom_flags = cls.calculate_domain_anomaly_score(content)
            if anomaly_score > max_anomaly_score:
                max_anomaly_score = anomaly_score
            chunk_risk_flags.extend(anom_flags)
            
            # Update chunk risk flags in memory and database if needed
            if chunk_risk_flags:
                all_risk_flags.extend(chunk_risk_flags)
                # update chunk in DB
                conn = Repository.create_chunk.__globals__["get_db_connection"]()
                c_cursor = conn.cursor()
                import json
                c_cursor.execute("UPDATE chunks SET risk_flags_json = ? WHERE chunk_id = ?",
                                 (json.dumps(chunk_risk_flags), chunk["chunk_id"]))
                conn.commit()
                conn.close()

        # Decision Policy:
        # Explicit instruction injection => BLOCK
        # High anomaly or stuffing => QUARANTINE
        # Normal => ALLOW
        overall_score = max(max_injection_score, max_stuffing_score, max_anomaly_score)
        
        if all_injection_detected or max_injection_score >= 0.85:
            decision = "blocked"
            action = "BLOCK"
            evidence_summary = f"Explicit instruction injection detected: {', '.join(set(all_evidence[:3]))}"
        elif overall_score >= 0.5 or max_anomaly_score >= 0.5 or max_stuffing_score >= 0.5:
            decision = "quarantined"
            action = "QUARANTINE"
            evidence_summary = f"Suspicious content or anomalous domain structure. Flags: {', '.join(set(all_risk_flags[:3]))}"
        else:
            decision = "allowed"
            action = "ALLOW"
            evidence_summary = "Content verified. No instruction injection, lexical stuffing, or anomalous domain patterns."

        # Persist decision to Document & Chunks
        Repository.update_document_trust_state(document_id, decision, ingestion_score=round(overall_score, 3))
        
        # Record Security Event if not allowed
        if decision in ["blocked", "quarantined"]:
            event_id = f"evt_stage1_{uuid.uuid4().hex[:8]}"
            Repository.record_security_event(
                event_id=event_id,
                attack_type="PROMPT_INJECTION_OR_ANOMALY" if all_injection_detected else "DOMAIN_ANOMALY",
                evidence=evidence_summary,
                action=action,
                source_document_id=document_id,
                source_chunk_id=chunks[0]["chunk_id"] if chunks else None,
                request_id=None
            )

        return {
            "document_id": document_id,
            "filename": doc["filename"],
            "trust_state": decision,
            "action": action,
            "ingestion_score": round(overall_score, 3),
            "evidence": evidence_summary,
            "risk_flags": list(set(all_risk_flags)),
            "injection_score": round(max_injection_score, 3),
            "anomaly_score": round(max_anomaly_score, 3),
            "stuffing_score": round(max_stuffing_score, 3),
            "chunks_inspected": len(chunks)
        }

