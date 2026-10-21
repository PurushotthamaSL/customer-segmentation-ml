from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ModelTrainRequest(BaseModel):
    features: List[str] = Field(default=["Annual Income (k$)", "Spending Score (1-100)"])
    n_clusters: int = Field(default=5, ge=2, le=10)
    use_scaler: bool = Field(default=True)
    random_state: int = Field(default=42)
    n_init: int = Field(default=10)

class ClusterProfile(BaseModel):
    cluster_id: int
    label: str
    count: int
    percentage: float
    feature_means: Dict[str, float]
    feature_medians: Dict[str, float]
    feature_mins: Dict[str, float]
    feature_maxs: Dict[str, float]
    centroid_coordinates: Dict[str, float]
    color: str
    characteristics: List[str]
    marketing_strategy: str

class ModelTrainResponse(BaseModel):
    n_clusters: int
    features: List[str]
    use_scaler: bool
    inertia: float
    silhouette_score: Optional[float]
    clusters: List[ClusterProfile]
    global_averages: Dict[str, float]
    trained_at: str
    total_customers: int

class ElbowPoint(BaseModel):
    k: int
    inertia: float
    silhouette_score: Optional[float]

class ElbowResponse(BaseModel):
    points: List[ElbowPoint]
    recommended_k: int
    silhouette_best_k: Optional[int]
    explanation: str

class UpdateLabelRequest(BaseModel):
    label: str
