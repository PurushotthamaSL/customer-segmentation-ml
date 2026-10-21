import io
import os
import shutil
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import pandas as pd
from fastapi import HTTPException

from app.config import (
    DEFAULT_DATASET_PATH,
    ACTIVE_DATASET_PATH,
    KAGGLE_SOURCE_URL,
    DATA_DIR
)

KAGGLE_REQUIRED_COLUMNS = [
    "CustomerID",
    "Gender",
    "Age",
    "Annual Income (k$)",
    "Spending Score (1-100)"
]

class DataService:
    def __init__(self):
        self._ensure_dataset_initialized()

    def _ensure_dataset_initialized(self) -> None:
        """Ensure active dataset exists from default if available."""
        if not ACTIVE_DATASET_PATH.exists() and DEFAULT_DATASET_PATH.exists():
            shutil.copyfile(DEFAULT_DATASET_PATH, ACTIVE_DATASET_PATH)

    def is_dataset_available(self) -> bool:
        """Check if any dataset is accessible."""
        return ACTIVE_DATASET_PATH.exists() or DEFAULT_DATASET_PATH.exists()

    def get_raw_dataframe(self) -> pd.DataFrame:
        """Load the active dataset into pandas DataFrame."""
        if not ACTIVE_DATASET_PATH.exists():
            if DEFAULT_DATASET_PATH.exists():
                shutil.copyfile(DEFAULT_DATASET_PATH, ACTIVE_DATASET_PATH)
            else:
                raise HTTPException(
                    status_code=404,
                    detail=(
                        f"Dataset file 'Mall_Customers.csv' was not found in 'backend/data/'. "
                        f"Please download it from Kaggle ({KAGGLE_SOURCE_URL}) and place it in 'backend/data/Mall_Customers.csv' "
                        f"or upload a CSV file via the Dataset Management page."
                    )
                )
        try:
            df = pd.read_csv(ACTIVE_DATASET_PATH)
            return df
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to read dataset CSV: {str(e)}"
            )

    def get_summary(self) -> Dict[str, Any]:
        """Generate comprehensive dataset summary, nulls, duplicates, and stats."""
        if not self.is_dataset_available():
            return {
                "file_name": "Mall_Customers.csv (Missing)",
                "source_type": "Kaggle Mall Customers",
                "total_rows": 0,
                "total_columns": 0,
                "columns": [],
                "numerical_columns": [],
                "categorical_columns": [],
                "missing_values": {},
                "duplicate_rows": 0,
                "summary_stats": {},
                "preview": [],
                "is_kaggle_original": False,
                "source_url": KAGGLE_SOURCE_URL,
                "is_ready": False,
                "setup_message": (
                    f"Mall_Customers.csv is not present in backend/data/. "
                    f"Please download from Kaggle ({KAGGLE_SOURCE_URL}) or upload via the Dataset page."
                )
            }

        df = self.get_raw_dataframe()
        
        # Check if identical to Kaggle structure
        is_kaggle = all(col in df.columns for col in KAGGLE_REQUIRED_COLUMNS)

        numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()

        missing = {col: int(df[col].isnull().sum()) for col in df.columns}
        duplicates = int(df.duplicated().sum())

        stats: Dict[str, Dict[str, float]] = {}
        for col in numerical_cols:
            series = df[col].dropna()
            if not series.empty:
                stats[col] = {
                    "count": float(len(series)),
                    "mean": round(float(series.mean()), 2),
                    "std": round(float(series.std()), 2) if len(series) > 1 else 0.0,
                    "min": round(float(series.min()), 2),
                    "q25": round(float(series.quantile(0.25)), 2),
                    "median": round(float(series.median()), 2),
                    "q75": round(float(series.quantile(0.75)), 2),
                    "max": round(float(series.max()), 2)
                }

        # Preview (first 10 records)
        preview_records = df.head(10).replace({np.nan: None}).to_dict(orient="records")

        return {
            "file_name": "Mall_Customers.csv" if is_kaggle else "Uploaded_Dataset.csv",
            "source_type": "Original Kaggle Mall Customers Dataset" if is_kaggle else "Custom Uploaded Customer Dataset",
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "columns": df.columns.tolist(),
            "numerical_columns": numerical_cols,
            "categorical_columns": categorical_cols,
            "missing_values": missing,
            "duplicate_rows": duplicates,
            "summary_stats": stats,
            "preview": preview_records,
            "is_kaggle_original": is_kaggle,
            "source_url": KAGGLE_SOURCE_URL,
            "is_ready": True,
            "setup_message": None
        }

    def save_uploaded_csv(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """Validate and save an uploaded CSV dataset."""
        if len(file_content) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(status_code=400, detail="Uploaded file exceeds 10MB limit.")

        try:
            # Decode file
            text_stream = io.StringIO(file_content.decode('utf-8'))
            df = pd.read_csv(text_stream)
        except UnicodeDecodeError:
            try:
                text_stream = io.StringIO(file_content.decode('latin1'))
                df = pd.read_csv(text_stream)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to parse CSV file with UTF-8 or Latin1: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid CSV structure: {str(e)}")

        if df.empty:
            raise HTTPException(status_code=400, detail="The uploaded CSV file is completely empty.")

        if len(df.columns) < 2:
            raise HTTPException(status_code=400, detail="CSV must contain at least 2 columns for customer segmentation.")

        numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        if len(numerical_cols) < 2:
            raise HTTPException(
                status_code=400,
                detail="Dataset must contain at least 2 numerical features for clustering (e.g. Income, Spending, Age)."
            )

        # Standardize or assign CustomerID if missing
        id_candidates = [col for col in df.columns if 'id' in col.lower() or 'cust' in col.lower()]
        if not id_candidates:
            df.insert(0, 'CustomerID', range(1, len(df) + 1))
        elif 'CustomerID' not in df.columns:
            df.rename(columns={id_candidates[0]: 'CustomerID'}, inplace=True)

        # Save to active dataset
        df.to_csv(ACTIVE_DATASET_PATH, index=False)

        return {
            "status": "success",
            "message": f"Successfully uploaded '{filename}' with {len(df)} rows and {len(df.columns)} columns.",
            "total_rows": len(df),
            "columns": df.columns.tolist(),
            "numerical_columns": numerical_cols
        }

    def reset_to_default(self) -> Dict[str, Any]:
        """Reset dataset to Kaggle Mall Customers original."""
        if not DEFAULT_DATASET_PATH.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Original Kaggle dataset not found at {DEFAULT_DATASET_PATH}. Please provide Mall_Customers.csv."
            )
        shutil.copyfile(DEFAULT_DATASET_PATH, ACTIVE_DATASET_PATH)
        return {
            "status": "success",
            "message": "Dataset successfully reset to the original Kaggle Mall Customers dataset."
        }

    def get_sample_csv_path(self) -> str:
        """Return the path to the original Kaggle sample dataset."""
        if not DEFAULT_DATASET_PATH.exists():
            raise HTTPException(status_code=404, detail="Default dataset not available for download.")
        return str(DEFAULT_DATASET_PATH)

    def filter_customers(
        self,
        clustered_df: Optional[pd.DataFrame] = None,
        search: Optional[str] = None,
        cluster: Optional[int] = None,
        gender: Optional[str] = None,
        min_age: Optional[int] = None,
        max_age: Optional[int] = None,
        min_income: Optional[float] = None,
        max_income: Optional[float] = None,
        min_score: Optional[float] = None,
        max_score: Optional[float] = None,
        sort_by: Optional[str] = "CustomerID",
        sort_dir: Optional[str] = "asc",
        page: int = 1,
        page_size: int = 15
    ) -> Dict[str, Any]:
        """Search, filter, sort, and paginate customers."""
        df = clustered_df.copy() if clustered_df is not None else self.get_raw_dataframe()

        # Search filter
        if search:
            search_str = str(search).strip().lower()
            if "CustomerID" in df.columns:
                mask = df["CustomerID"].astype(str).str.lower().str.contains(search_str)
            else:
                mask = pd.Series([False] * len(df))
            if "Gender" in df.columns:
                mask = mask | df["Gender"].astype(str).str.lower().str.contains(search_str)
            if "segment_label" in df.columns:
                mask = mask | df["segment_label"].astype(str).str.lower().str.contains(search_str)
            df = df[mask]

        # Cluster filter
        if cluster is not None and "cluster" in df.columns:
            df = df[df["cluster"] == cluster]

        # Gender filter
        if gender and gender.lower() != "all" and "Gender" in df.columns:
            df = df[df["Gender"].astype(str).str.lower() == gender.lower()]

        # Age range filter
        if "Age" in df.columns:
            if min_age is not None:
                df = df[df["Age"] >= min_age]
            if max_age is not None:
                df = df[df["Age"] <= max_age]

        # Income range filter
        income_col = next((c for c in df.columns if "income" in c.lower()), None)
        if income_col:
            if min_income is not None:
                df = df[df[income_col] >= min_income]
            if max_income is not None:
                df = df[df[income_col] <= max_income]

        # Spending Score range filter
        score_col = next((c for c in df.columns if "spending" in c.lower() or "score" in c.lower()), None)
        if score_col:
            if min_score is not None:
                df = df[df[score_col] >= min_score]
            if max_score is not None:
                df = df[df[score_col] <= max_score]

        # Sorting
        if sort_by and sort_by in df.columns:
            ascending = (sort_dir.lower() != "desc")
            df = df.sort_values(by=sort_by, ascending=ascending)

        total = len(df)
        total_pages = max(1, (total + page_size - 1) // page_size)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        page_df = df.iloc[start_idx:end_idx]

        items = page_df.replace({np.nan: None}).to_dict(orient="records")

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "columns": df.columns.tolist()
        }
