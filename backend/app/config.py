import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_DATASET_PATH = DATA_DIR / "Mall_Customers.csv"
ACTIVE_DATASET_PATH = DATA_DIR / "current_dataset.csv"
MODEL_SAVE_PATH = DATA_DIR / "fitted_kmeans.joblib"
METADATA_SAVE_PATH = DATA_DIR / "model_metadata.json"

# Default ML Parameters
DEFAULT_FEATURES = ["Annual Income (k$)", "Spending Score (1-100)"]
ALL_NUMERICAL_FEATURES = ["Age", "Annual Income (k$)", "Spending Score (1-100)"]
DEFAULT_CLUSTERS = 5
RANDOM_STATE = 42

KAGGLE_SOURCE_URL = "https://www.kaggle.com/datasets/vjchoudhary7/customer-segmentation-tutorial-in-python"
