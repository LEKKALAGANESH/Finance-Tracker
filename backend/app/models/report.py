from pydantic import BaseModel
from typing import Literal


class MonthlyReportItem(BaseModel):
    """Monthly report item."""

    month: str
    total_spent: float
    total_income: float
    net_balance: float
    transaction_count: int


class CategoryBreakdown(BaseModel):
    """Category breakdown for reports."""

    category_id: str
    category_name: str
    category_color: str
    category_icon: str
    total_amount: float
    percentage: float
    transaction_count: int
    average_per_transaction: float


class MonthlyReport(BaseModel):
    """Monthly report model."""

    period: str
    data: list[MonthlyReportItem]
    total_spent: float
    total_income: float
    average_monthly_spending: float


class CategoryReport(BaseModel):
    """Category report model."""

    period: str
    breakdown: list[CategoryBreakdown]
    total_spent: float


class ExportRequest(BaseModel):
    """Export request model."""

    format: Literal["csv", "pdf"]
    start_date: str
    end_date: str
    include_categories: bool = True
    include_charts: bool = False


class ExportResponse(BaseModel):
    """Export response model."""

    filename: str
    content_type: str
    download_url: str | None = None
