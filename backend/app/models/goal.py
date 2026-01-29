from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime


GoalStatus = Literal["active", "completed", "cancelled"]


class GoalBase(BaseModel):
    """Base goal model."""

    name: str = Field(max_length=50)
    target_amount: float = Field(gt=0)
    deadline: str
    icon: str
    color: str


class GoalCreate(GoalBase):
    """Create goal model."""

    pass


class GoalUpdate(BaseModel):
    """Update goal model."""

    name: str | None = Field(default=None, max_length=50)
    target_amount: float | None = Field(default=None, gt=0)
    deadline: str | None = None
    icon: str | None = None
    color: str | None = None
    status: GoalStatus | None = None


class GoalResponse(GoalBase):
    """Goal response model."""

    id: str
    user_id: str
    current_amount: float
    status: GoalStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ContributionCreate(BaseModel):
    """Create contribution model."""

    amount: float = Field(gt=0)
    note: str | None = Field(default=None, max_length=100)


class ContributionResponse(BaseModel):
    """Contribution response model."""

    id: str
    goal_id: str
    amount: float
    note: str | None
    created_at: datetime

    class Config:
        from_attributes = True
