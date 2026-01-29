from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional


class ExpenseBase(BaseModel):
    """Base expense model."""

    category_id: str
    amount: float = Field(gt=0, description="Amount must be positive")
    description: str = Field(max_length=200)
    date: str
    payment_method: str


class ExpenseCreate(ExpenseBase):
    """Create expense model."""

    pass


class ExpenseUpdate(BaseModel):
    """Update expense model."""

    category_id: str | None = None
    amount: float | None = Field(default=None, gt=0)
    description: str | None = Field(default=None, max_length=200)
    date: str | None = None
    payment_method: str | None = None


class CategoryInfo(BaseModel):
    """Category info for expense."""

    id: str
    name: str
    icon: str
    color: str


class ExpenseResponse(ExpenseBase):
    """Expense response model."""

    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    category: CategoryInfo | None = None

    class Config:
        from_attributes = True


class ExpenseFilters(BaseModel):
    """Expense filter parameters."""

    start_date: str | None = None
    end_date: str | None = None
    category_id: str | None = None
    min_amount: float | None = None
    max_amount: float | None = None
    search: str | None = None
    payment_method: str | None = None
