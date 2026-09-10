import re
import uuid
from typing import List, Dict, Any, Tuple
from backend.app.models.repository import Repository

class Stage3Inspector:
    """
    Stage 3: Output Inspection & Claim-to-Evidence Grounding.
    Inspects generated answer before delivery to user.
    """
    
    # Suspicious instruction echoes indicating prompt injection success
    SUSPICIOUS_ECHO_PATTERNS = [
        (r"(?i)system\s*override\s*(acknowledged|confirmed|active)", "SYSTEM_OVERRIDE_ECHO"),
        (r"(?i)\$10,?000\s*(cash\s*)?refund", "INJECTED_REFUND_POLICY_ECHO"),
        (r"(?i)all\s+customers\s+are\s+entitled\s+to", "INJECTED_ENTITLEMENT_CLAIM"),
        (r"(?i)submit\s+your\s+(credentials|passwords|keys)", "CREDENTIAL_PHISHING_DIRECTIVE"),
        (r"(?i)ignore\s+all\s+previous", "INSTRUCTION_LEAK"),
    ]
    
    # Allowed domains for external references (enterprise whitelist)
    WHITELISTED_DOMAINS = ["acmecorp.internal", "localhost", "127.0.0.1"]

    @classmethod
    def detect_instruction_echo(cls, answer: str) -> Tuple[bool, List[str]]:
        """
        Detects if output echoes attacker-injected instructions.
        """
        echoes = []
        for pattern, label in cls.SUSPICIOUS_ECHO_PATTERNS:
            if re.search(pattern, answer):
                echoes.append(label)
        return len(echoes) > 0, echoes

    @classmethod
    def detect_unsolicited_external_urls(cls, answer: str) -> Tuple[bool, List[str]]:
        """
        Detects unauthorized external URLs / exfiltration links in the output.
        """
        urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', answer)
        unsolicited = []
        for url in urls:
            is_whitelisted = any(domain in url.lower() for domain in cls.WHITELISTED_DOMAINS)
            if not is_whitelisted:
                unsolicited.append(url)
        return len(unsolicited) > 0, unsolicited

    @classmethod
    def extract_and_ground_claims(cls, answer: str, retrieved_chunks: List[Dict[str, Any]],
                                  request_id: str) -> List[Dict[str, Any]]:
        """
        Breaks answer into claim sentences and verifies prototype grounding against retrieved chunks.
        """
        # Split answer into sentences
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', answer) if len(s.strip()) > 15]
        if not sentences:
            sentences = [answer.strip()]
            
        chunk_lookup = {c["chunk_id"]: c["content"].lower() for c in retrieved_chunks}
        claims = []
        
        for sentence in sentences:
            claim_id = f"claim_{uuid.uuid4().hex[:8]}"
            
            # Extract cited chunk IDs in the sentence: e.g. [doc_xxx_c1]
            cited_chunk_ids = re.findall(r'\[([a-zA-Z0-9_\-]+)\]', sentence)
            
            # Clean sentence text of citation brackets for keyword matching
            clean_sentence = re.sub(r'\[.*?\]', '', sentence).strip()
            clean_words = set(re.findall(r'\b\w{4,}\b', clean_sentence.lower()))
            
            supporting_chunks = []
            
            # Check cited chunks first
            for chunk_id in cited_chunk_ids:
                if chunk_id in chunk_lookup:
                    supporting_chunks.append(chunk_id)
                    
            # Also check lexical overlap with retrieved chunks (prototype grounding)
            if not supporting_chunks and clean_words:
                for c_id, c_content in chunk_lookup.items():
                    c_words = set(re.findall(r'\b\w{4,}\b', c_content))
                    overlap = len(clean_words.intersection(c_words))
                    if overlap >= 3 or (len(clean_words) > 0 and overlap / len(clean_words) > 0.4):
                        supporting_chunks.append(c_id)
            
            supporting_chunks = list(set(supporting_chunks))
            
            # Check for echoes within this claim
            is_echo, echo_labels = cls.detect_instruction_echo(sentence)
            has_url, found_urls = cls.detect_unsolicited_external_urls(sentence)
            
            if is_echo or has_url:
                inspection_status = "SUSPICIOUS_MALICIOUS"
                evidence = f"Matched malicious echo: {', '.join(echo_labels)} / URLs: {', '.join(found_urls)}"
            elif supporting_chunks:
                inspection_status = "SUPPORTED"
                evidence = f"Grounding verified against chunk(s): {', '.join(supporting_chunks)}"
            else:
                inspection_status = "UNSUPPORTED"
                evidence = "Claim text lacks direct lexical grounding in authorized retrieved chunks."
                
            claim_record = Repository.record_claim(
                claim_id=claim_id,
                request_id=request_id,
                claim_text=sentence,
                supporting_chunk_ids=supporting_chunks,
                inspection_status=inspection_status,
                evidence=evidence
            )
            claims.append(claim_record)
            
        return claims

    @classmethod
    def inspect(cls, answer: str, retrieved_chunks: List[Dict[str, Any]], request_id: str) -> Dict[str, Any]:
        """
        Full Stage 3 inspection pipeline.
        Returns: status ('SAFE', 'REVIEW', 'BLOCK/REFUSE'), evidence, claims, malicious_chunk_ids
        """
        has_echo, echo_types = cls.detect_instruction_echo(answer)
        has_exfil_url, exfil_urls = cls.detect_unsolicited_external_urls(answer)
        claims = cls.extract_and_ground_claims(answer, retrieved_chunks, request_id)
        
        unsupported_count = sum(1 for c in claims if c["inspection_status"] == "UNSUPPORTED")
        suspicious_count = sum(1 for c in claims if c["inspection_status"] == "SUSPICIOUS_MALICIOUS")
        
        evidence_list = []
        if has_echo:
            evidence_list.append(f"Instruction echo detected: {', '.join(echo_types)}")
        if has_exfil_url:
            evidence_list.append(f"Unsolicited external exfiltration URLs: {', '.join(exfil_urls)}")
        if unsupported_count > 0:
            evidence_list.append(f"{unsupported_count} unsupported claim(s) found without authorized evidence")
            
        # Determine malicious source chunks
        malicious_chunk_ids = []
        if has_echo or has_exfil_url or suspicious_count > 0:
            # The malicious payload originated from one of the retrieved chunks
            for c in retrieved_chunks:
                # Check if this chunk content gave rise to the injection
                if any(w in c["content"].lower() for w in ["override", "ignore", "refund", "attacker-exfil", "$10,000"]):
                    malicious_chunk_ids.append(c["chunk_id"])
            if not malicious_chunk_ids and retrieved_chunks:
                malicious_chunk_ids.append(retrieved_chunks[0]["chunk_id"])

        if has_echo or has_exfil_url or suspicious_count > 0:
            status = "BLOCK/REFUSE"
            action = "REFUSE"
        elif unsupported_count > 0:
            status = "REVIEW"
            action = "FLAG_FOR_REVIEW"
        else:
            status = "SAFE"
            action = "ALLOW"
            
        return {
            "status": status,
            "action": action,
            "has_instruction_echo": has_echo,
            "has_unsolicited_urls": has_exfil_url,
            "echo_types": echo_types,
            "exfil_urls": exfil_urls,
            "claims": claims,
            "evidence": "; ".join(evidence_list) if evidence_list else "Output passed all grounding and safety checks.",
            "malicious_chunk_ids": malicious_chunk_ids
        }

