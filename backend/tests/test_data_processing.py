import pytest
import pandas as pd
import numpy as np
from app.services.data_service import DataService

def test_data_service_initialization():
    service = DataService()
    assert service.is_dataset_available() is True

def test_dataset_summary():
    service = DataService()
    summary = service.get_summary()
    
    assert summary["is_ready"] is True
    assert summary["total_rows"] == 200
    assert "Annual Income (k$)" in summary["columns"]
    assert "Spending Score (1-100)" in summary["columns"]
    assert summary["missing_values"]["Annual Income (k$)"] == 0
    assert summary["summary_stats"]["Age"]["mean"] > 0

def test_filter_customers():
    service = DataService()
    # Filter by gender
    res_female = service.filter_customers(gender="Female", page=1, page_size=200)
    assert all(item["Gender"] == "Female" for item in res_female["items"])
    
    # Filter by income range
    res_inc = service.filter_customers(min_income=50, max_income=80, page=1, page_size=200)
    assert all(50 <= item["Annual Income (k$)"] <= 80 for item in res_inc["items"])
