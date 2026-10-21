from fastapi import APIRouter, Depends
from app.config import DEFAULT_DATASET_PATH, ACTIVE_DATASET_PATH, KAGGLE_SOURCE_URL

router = APIRouter(prefix="/api/health", tags=["Health"])

@router.get("")
def check_health():
    is_default_present = DEFAULT_DATASET_PATH.exists()
    is_active_present = ACTIVE_DATASET_PATH.exists()
    
    return {
        "status": "healthy",
        "service": "CustomerLens AI API",
        "dataset_available": is_active_present or is_default_present,
        "default_dataset_path": str(DEFAULT_DATASET_PATH),
        "is_default_dataset_present": is_default_present,
        "is_active_dataset_present": is_active_present,
        "kaggle_source_url": KAGGLE_SOURCE_URL,
        "version": "1.0.0"
    }
