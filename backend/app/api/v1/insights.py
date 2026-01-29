from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id, get_db_client
from app.models.insight import (
    SpendingSummary,
    AIInsight,
    ChatRequest,
    ChatResponse,
    SpendingPrediction,
)
from app.models.common import DataResponse
from app.services.insight_service import InsightService

router = APIRouter()


@router.get("/summary", response_model=DataResponse[SpendingSummary])
async def get_spending_summary(
    period: str = "month",  # week, month, year
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Get spending summary for the specified period."""
    service = InsightService(db)
    result = await service.get_spending_summary(user_id, period)
    return DataResponse(data=result)


@router.get("/tips", response_model=DataResponse[list[AIInsight]])
async def get_spending_tips(
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Get AI-generated spending tips based on user's financial data."""
    service = InsightService(db)
    result = await service.get_spending_tips(user_id)
    return DataResponse(data=result)


@router.post("/chat", response_model=DataResponse[ChatResponse])
async def chat_with_ai(
    request: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Chat with AI about finances."""
    service = InsightService(db)
    result = await service.chat(user_id, request.message, request.history)
    return DataResponse(data=result)


@router.get("/predictions", response_model=DataResponse[SpendingPrediction])
async def get_spending_predictions(
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Get AI-generated spending predictions for next month."""
    service = InsightService(db)
    result = await service.get_predictions(user_id)
    return DataResponse(data=result)
