import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["dataset_available"] is True

def test_api_dataset_summary():
    response = client.get("/api/dataset/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["is_ready"] is True
    assert data["total_rows"] == 200
    assert "Annual Income (k$)" in data["columns"]

def test_api_model_status():
    response = client.get("/api/model/status")
    assert response.status_code == 200
    data = response.json()
    assert data["n_clusters"] >= 2
    assert "clusters" in data

def test_api_model_elbow():
    response = client.get("/api/model/elbow?min_k=2&max_k=6")
    assert response.status_code == 200
    data = response.json()
    assert len(data["points"]) == 5
    assert "recommended_k" in data

def test_api_customers_list():
    response = client.get("/api/customers?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 10
    assert data["total"] == 200
    assert "CustomerID" in data["items"][0]

def test_api_insights():
    response = client.get("/api/insights")
    assert response.status_code == 200
    data = response.json()
    assert "playbooks" in data
    assert "executive_summary" in data
    assert len(data["playbooks"]) > 0
