import pytest
from app.services.data_service import DataService
from app.services.ml_service import MLService

def test_kmeans_training():
    ds = DataService()
    mls = MLService(ds)
    
    result = mls.train_kmeans(
        features=["Annual Income (k$)", "Spending Score (1-100)"],
        n_clusters=5,
        use_scaler=True,
        random_state=42
    )
    
    assert result["n_clusters"] == 5
    assert len(result["clusters"]) == 5
    assert result["inertia"] > 0
    assert result["silhouette_score"] is not None
    assert result["silhouette_score"] > 0.3  # Well-clustered for Mall Customers
    assert result["total_customers"] == 200

def test_dynamic_segment_labeling():
    ds = DataService()
    mls = MLService(ds)
    result = mls.train_kmeans(n_clusters=5)
    
    labels = [c["label"] for c in result["clusters"]]
    # Ensure labels are descriptive and not merely 'Cluster 0'
    assert len(set(labels)) == 5
    for l in labels:
        assert len(l) > 3

def test_elbow_and_silhouette():
    ds = DataService()
    mls = MLService(ds)
    elbow_data = mls.compute_elbow_and_silhouette(min_k=2, max_k=6)
    
    assert len(elbow_data["points"]) == 5
    assert elbow_data["recommended_k"] in range(2, 7)
    # Inertia should be monotonically non-increasing
    inertias = [p["inertia"] for p in elbow_data["points"]]
    for i in range(len(inertias) - 1):
        assert inertias[i] >= inertias[i + 1]

def test_update_cluster_label():
    ds = DataService()
    mls = MLService(ds)
    mls.train_kmeans(n_clusters=5)
    
    res = mls.update_cluster_label(0, "Custom VIP Tier")
    assert res["status"] == "success"
    assert mls.custom_labels[0] == "Custom VIP Tier"
