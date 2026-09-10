import pytest
from backend.app.services.stage2_retrieval import Stage2RetrievalService
from backend.app.services.demo_seed_service import DemoSeedService
from backend.app.models.repository import Repository

def setup_module():
    DemoSeedService.seed_data(scan_stage1=True)

def test_cross_tenant_isolation_strictly_blocked():
    # Tenant A user attempts to retrieve Tenant B confidential IP
    res = Stage2RetrievalService.search(
        query="APEX-CRYPTO-512 quantum algorithm",
        tenant_id="tenant_a",
        user_id="tenantA_user",
        role="analyst",
        authorized_scope="internal_policy",
        security_mode="ON"
    )
    # Ensure NO chunks from tenant_b are retrieved
    for chunk in res.get("retrieved_chunks", []):
        assert chunk["tenant_id"] == "tenant_a"
        assert "APEX-CRYPTO" not in chunk["content"]

def test_insufficient_authorized_context_safely_handled():
    # Random query that doesn't exist in Tenant A
    res = Stage2RetrievalService.search(
        query="Astronaut orbital mechanics rocket telemetry",
        tenant_id="tenant_a",
        user_id="tenantA_user",
        role="analyst",
        authorized_scope="internal_policy",
        security_mode="ON"
    )
    assert res["status"] == "INSUFFICIENT_AUTHORIZED_CONTEXT"
    assert len(res["retrieved_chunks"]) == 0

def test_api_requests_trace_endpoint():
    from fastapi.testclient import TestClient
    from backend.app.main import app
    client = TestClient(app)
    
    # Run a search to generate a trace
    res = client.post("/api/retrieval/search", json={
        "query": "Security controls access policy",
        "tenant_id": "tenant_a"
    })
    req_id = res.json()["request_id"]
    
    # Call the forensic trace endpoint
    trace_res = client.get(f"/api/requests/{req_id}/trace")
    assert trace_res.status_code == 200
    trace_data = trace_res.json()
    assert trace_data["request_id"] == req_id
    assert "authorized_candidate_ids" in trace_data

