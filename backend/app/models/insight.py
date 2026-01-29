from pydantic import BaseModel
from typing import Literal
from datetime import datetime


class CategorySpending(BaseModel):
    """Category spending breakdown."""

    category_id: str
    category_name: str
    category_color: str
    amount: float
    percentage: float
    transaction_count: int


class SpendingComparison(BaseModel):
    """Spending comparison with previous period."""

    previous_period: float
    change_percentage: float
    trend: Literal["up", "down", "stable"]


class SpendingSummary(BaseModel):
    """Spending summary model."""

    total_spent: float
    total_income: float
    net_balance: float
    top_categories: list[CategorySpending]
    comparison: SpendingComparison


class AIInsight(BaseModel):
    """AI generated insight."""

    id: str
    type: Literal["tip", "warning", "achievement", "prediction"]
    title: str
    description: str
    priority: Literal["low", "medium", "high"]
    created_at: datetime


class ChatMessage(BaseModel):
    """Chat message model."""

    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    """Chat request model."""

    message: str
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    """Chat response model."""

    message: str
    timestamp: datetime


class PredictionBreakdown(BaseModel):
    """Prediction breakdown by category."""

    category_id: str
    category_name: str
    predicted_amount: float


class SpendingPrediction(BaseModel):
    """Spending prediction model."""

    period: str
    predicted_amount: float
    confidence: float
    breakdown: list[PredictionBreakdown]
