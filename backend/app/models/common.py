from pydantic import BaseModel
from typing import Generic, TypeVar
from datetime import datetime

T = TypeVar("T")


class ResponseBase(BaseModel):
    """Base response model."""

    message: str | None = None


class DataResponse(ResponseBase, Generic[T]):
    """Response with data."""

    data: T


class PaginatedResponse(ResponseBase, Generic[T]):
    """Paginated response."""

    data: list[T]
    total: int
    page: int
    limit: int
    total_pages: int


class DateRangeParams(BaseModel):
    """Date range parameters."""

    start_date: str
    end_date: str


class QueryParams(BaseModel):
    """Common query parameters."""

    page: int = 1
    limit: int = 10
    sort_by: str | None = None
    sort_order: str = "desc"
    search: str | None = None
