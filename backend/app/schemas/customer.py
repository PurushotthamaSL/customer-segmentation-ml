from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class CustomerRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    customer_id: int = Field(alias="CustomerID")
    gender: Optional[str] = Field(None, alias="Gender")
    age: int = Field(alias="Age")
    annual_income: float = Field(alias="Annual Income (k$)")
    spending_score: float = Field(alias="Spending Score (1-100)")
    cluster: Optional[int] = Field(None)
    segment_label: Optional[str] = Field(None)


class CustomerListResponse(BaseModel):
    items: List[Dict[str, Any]]
    total: int
    page: int
    page_size: int
    total_pages: int
    columns: List[str]

class CustomerDetailResponse(BaseModel):
    customer: Dict[str, Any]
    percentiles: Dict[str, float]
    segment_info: Optional[Dict[str, Any]] = None
    distance_to_centroid: Optional[float] = None
    key_recommendation: Optional[str] = None

class DatasetSummary(BaseModel):
    file_name: str
    source_type: str
    total_rows: int
    total_columns: int
    columns: List[str]
    numerical_columns: List[str]
    categorical_columns: List[str]
    missing_values: Dict[str, int]
    duplicate_rows: int
    summary_stats: Dict[str, Dict[str, float]]
    preview: List[Dict[str, Any]]
    is_kaggle_original: bool
    source_url: str
    is_ready: bool
    setup_message: Optional[str] = None
