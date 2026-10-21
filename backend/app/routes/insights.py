from fastapi import APIRouter, Depends
from app.services.insight_service import InsightService
from app.dependencies import get_insight_service

router = APIRouter(prefix="/api/insights", tags=["Business Insights"])

@router.get("")
def get_business_insights(
    insight_service: InsightService = Depends(get_insight_service)
):
    """
    Retrieve rule-based actionable business intelligence recommendations
    derived strictly from calculated cluster distributions.
    """
    return insight_service.generate_insights()
