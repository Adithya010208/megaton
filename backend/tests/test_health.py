from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OK"
    assert "Three-Stage RAG Integrity Shield" in data["service"]
    assert data["security_pipeline"]["stage_1_ingestion"] == "ACTIVE"
    assert data["security_pipeline"]["stage_2_authorized_retrieval"] == "ACTIVE"
    assert data["security_pipeline"]["stage_3_output_inspection"] == "ACTIVE"
    assert data["security_pipeline"]["closed_loop_quarantine"] == "ACTIVE"

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "/docs" in data["docs_url"]

