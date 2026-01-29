from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime


BudgetPeriod = Literal["weekly", "monthly", "yearly"]


class BudgetBase(BaseModel):
    """Base budget model."""

    category_id: str | None = None  # None means overall budget
    amount: float = Field(gt=0, description="Budget amount must be positive")
    period: BudgetPeriod
    start_date: str
    alert_threshold: int = Field(default=80, ge=1, le=100)


class BudgetCreate(BudgetBase):
    """Create budget model."""

    pass


class BudgetUpdate(BaseModel):
    """Update budget model."""

    category_id: str | None = None
    amount: float | None = Field(default=None, gt=0)
    period: BudgetPeriod | None = None
    start_date: str | None = None
    alert_threshold: int | None = Field(default=None, ge=1, le=100)


class CategoryInfo(BaseModel):
    """Category info for budget."""

    id: str
    name: str
    icon: str
    color: str


class BudgetResponse(BudgetBase):
    """Budget response model."""

    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    category: CategoryInfo | None = None

    class Config:
        from_attributes = True


class BudgetStatus(BaseModel):
    """Budget status with spending info."""

    budget: BudgetResponse
    spent: float
    remaining: float
    percentage: float
    is_over_budget: bool
    is_near_limit: bool
