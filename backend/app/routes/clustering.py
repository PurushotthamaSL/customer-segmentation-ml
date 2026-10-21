from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from app.services.ml_service import MLService
from app.schemas.model import (
    ModelTrainRequest,
    ModelTrainResponse,
    ElbowResponse,
    UpdateLabelRequest,
    ClusterProfile
)
from app.dependencies import get_ml_service

router = APIRouter(prefix="/api", tags=["Model & Clustering"])

@router.post("/model/train", response_model=ModelTrainResponse)
def train_model(
    request: ModelTrainRequest,
    ml_service: MLService = Depends(get_ml_service)
):
    """
    Train K-Means clustering model using Scikit-learn.
    Applies StandardScaler, computes inertia & silhouette scores,
    and derives interpretable business segment profiles.
    """
    try:
        result = ml_service.train_kmeans(
            features=request.features,
            n_clusters=request.n_clusters,
            use_scaler=request.use_scaler,
            random_state=request.random_state,
            n_init=request.n_init
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/model/status")
def get_model_status(ml_service: MLService = Depends(get_ml_service)):
    """Retrieve current model metadata and training status."""
    if ml_service.metadata is None:
        # Train default model if not already trained
        try:
            return ml_service.train_kmeans()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to initialize default model: {str(e)}")
    return ml_service.metadata

@router.get("/model/elbow", response_model=ElbowResponse)
def get_elbow_data(
    features: Optional[List[str]] = Query(None),
    min_k: int = Query(2, ge=2),
    max_k: int = Query(10, le=12),
    use_scaler: bool = Query(True),
    ml_service: MLService = Depends(get_ml_service)
):
    """
    Computes Inertia and Silhouette scores across K=2..10 for the Elbow Method.
    Provides mathematical guidance for cluster selection.
    """
    try:
        return ml_service.compute_elbow_and_silhouette(
            features=features,
            min_k=min_k,
            max_k=max_k,
            use_scaler=use_scaler
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/segments", response_model=List[ClusterProfile])
def get_segments(ml_service: MLService = Depends(get_ml_service)):
    """Retrieve all identified customer segment profiles."""
    if ml_service.metadata is None:
        ml_service.train_kmeans()
    return ml_service.metadata.get("clusters", [])

@router.put("/segments/{cluster_id}/label")
def update_segment_label(
    cluster_id: int,
    request: UpdateLabelRequest,
    ml_service: MLService = Depends(get_ml_service)
):
    """Update and persist a custom interpretable business label for a segment."""
    try:
        return ml_service.update_cluster_label(cluster_id, request.label)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/scatter-data")
def get_scatter_data(
    x_feature: Optional[str] = Query(None),
    y_feature: Optional[str] = Query(None),
    ml_service: MLService = Depends(get_ml_service)
):
    """
    Returns customer points and cluster centroids formatted specifically
    for interactive 2D scatter plots (Recharts).
    """
    if ml_service.clustered_df is None or ml_service.metadata is None:
        ml_service.train_kmeans()

    df = ml_service.clustered_df
    features = ml_service.metadata.get("features", ["Annual Income (k$)", "Spending Score (1-100)"])

    x_col = x_feature or (features[0] if len(features) > 0 else "Annual Income (k$)")
    y_col = y_feature or (features[1] if len(features) > 1 else "Spending Score (1-100)")

    if x_col not in df.columns or y_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Features '{x_col}' or '{y_col}' not found in dataset.")

    clusters = ml_service.metadata.get("clusters", [])
    color_map = {c["cluster_id"]: c["color"] for c in clusters}
    label_map = {c["cluster_id"]: c["label"] for c in clusters}

    points = []
    for _, row in df.iterrows():
        cid = int(row.get("cluster", 0))
        points.append({
            "id": int(row.get("CustomerID", 0)),
            "x": float(row[x_col]),
            "y": float(row[y_col]),
            "cluster": cid,
            "label": label_map.get(cid, f"Cluster {cid}"),
            "color": color_map.get(cid, "#8B5CF6"),
            "gender": str(row.get("Gender", "Unknown")),
            "age": int(row.get("Age", 0)) if "Age" in df.columns else None
        })

    centroids = []
    for c in clusters:
        centroids.append({
            "cluster": c["cluster_id"],
            "label": f"Centroid: {c['label']}",
            "x": c["centroid_coordinates"].get(x_col, c["feature_means"].get(x_col, 0)),
            "y": c["centroid_coordinates"].get(y_col, c["feature_means"].get(y_col, 0)),
            "color": c["color"]
        })

    return {
        "x_feature": x_col,
        "y_feature": y_col,
        "points": points,
        "centroids": centroids,
        "total_points": len(points)
    }
