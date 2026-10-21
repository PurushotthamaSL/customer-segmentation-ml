from app.services.data_service import DataService
from app.services.ml_service import MLService
from app.services.insight_service import InsightService

# Global shared service instances
data_service = DataService()
ml_service = MLService(data_service)
insight_service = InsightService(ml_service)

def get_data_service() -> DataService:
    return data_service

def get_ml_service() -> MLService:
    return ml_service

def get_insight_service() -> InsightService:
    return insight_service
