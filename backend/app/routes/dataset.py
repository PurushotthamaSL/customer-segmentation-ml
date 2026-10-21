import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from app.services.data_service import DataService
from app.services.ml_service import MLService
from app.schemas.customer import DatasetSummary
from app.dependencies import get_data_service, get_ml_service

router = APIRouter(prefix="/api/dataset", tags=["Dataset"])

@router.get("/summary", response_model=DatasetSummary)
def get_dataset_summary(data_service: DataService = Depends(get_data_service)):
    """Retrieve comprehensive dataset statistics, column info, and preview."""
    return data_service.get_summary()

@router.get("/sample-csv")
def download_sample_csv(data_service: DataService = Depends(get_data_service)):
    """Download the clean sample Kaggle Mall Customers CSV dataset."""
    file_path = data_service.get_sample_csv_path()
    return FileResponse(
        path=file_path,
        filename="Mall_Customers.csv",
        media_type="text/csv"
    )

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    data_service: DataService = Depends(get_data_service),
    ml_service: MLService = Depends(get_ml_service)
):
    """Upload and validate a new customer dataset in CSV format."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Only CSV files (.csv) are supported."
        )

    content = await file.read()
    result = data_service.save_uploaded_csv(content, file.filename)
    
    # Automatically re-train model on the newly uploaded data
    try:
        num_cols = result.get("numerical_columns", [])
        features = [c for c in num_cols if "id" not in c.lower()][:2]
        if len(features) >= 2:
            ml_service.train_kmeans(features=features)
    except Exception as e:
        print(f"[Upload] Auto re-training note: {e}")

    return result

@router.post("/reset")
def reset_dataset(
    data_service: DataService = Depends(get_data_service),
    ml_service: MLService = Depends(get_ml_service)
):
    """Reset active dataset back to the authentic Kaggle Mall Customers dataset."""
    result = data_service.reset_to_default()
    # Re-train on original Kaggle default features
    ml_service.train_kmeans()
    return result
