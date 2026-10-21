import io
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
import pandas as pd

from app.services.data_service import DataService
from app.services.ml_service import MLService
from app.schemas.customer import CustomerListResponse, CustomerDetailResponse
from app.dependencies import get_data_service, get_ml_service

router = APIRouter(prefix="/api/customers", tags=["Customers"])

@router.get("", response_model=CustomerListResponse)
def get_customers(
    search: Optional[str] = Query(None),
    cluster: Optional[int] = Query(None),
    gender: Optional[str] = Query(None),
    min_age: Optional[int] = Query(None),
    max_age: Optional[int] = Query(None),
    min_income: Optional[float] = Query(None),
    max_income: Optional[float] = Query(None),
    min_score: Optional[float] = Query(None),
    max_score: Optional[float] = Query(None),
    sort_by: Optional[str] = Query("CustomerID"),
    sort_dir: Optional[str] = Query("asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    data_service: DataService = Depends(get_data_service),
    ml_service: MLService = Depends(get_ml_service)
):
    """Search, filter, sort, and paginate customers with cluster assignments."""
    if ml_service.clustered_df is None:
        ml_service.train_kmeans()

    result = data_service.filter_customers(
        clustered_df=ml_service.clustered_df,
        search=search,
        cluster=cluster,
        gender=gender,
        min_age=min_age,
        max_age=max_age,
        min_income=min_income,
        max_income=max_income,
        min_score=min_score,
        max_score=max_score,
        sort_by=sort_by,
        sort_dir=sort_dir,
        page=page,
        page_size=page_size
    )
    return result

@router.get("/export")
def export_customers_csv(
    cluster: Optional[int] = Query(None),
    data_service: DataService = Depends(get_data_service),
    ml_service: MLService = Depends(get_ml_service)
):
    """Export filtered or all customers with cluster assignments as a CSV file."""
    if ml_service.clustered_df is None:
        ml_service.train_kmeans()

    df = ml_service.clustered_df.copy()
    if cluster is not None:
        df = df[df["cluster"] == cluster]

    stream = io.StringIO()
    df.to_csv(stream, index=False)
    stream.seek(0)

    filename = f"CustomerLens_Segmented_Customers{'_Cluster_' + str(cluster) if cluster is not None else ''}.csv"

    return StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/{customer_id}", response_model=CustomerDetailResponse)
def get_customer_detail(
    customer_id: int,
    ml_service: MLService = Depends(get_ml_service)
):
    """Retrieve detailed analytics, percentiles, and recommendations for a single customer."""
    try:
        return ml_service.get_customer_detail(customer_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
