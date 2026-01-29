from fastapi import APIRouter, Depends, Query
from typing import Optional

from app.api.deps import get_current_user_id, get_db_client
from app.models.expense import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    ExpenseFilters,
)
from app.models.common import DataResponse, PaginatedResponse
from app.services.expense_service import ExpenseService

router = APIRouter()


@router.get("", response_model=PaginatedResponse[ExpenseResponse])
async def list_expenses(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category_id: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    search: Optional[str] = None,
    payment_method: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """List expenses with optional filters."""
    filters = ExpenseFilters(
        start_date=start_date,
        end_date=end_date,
        category_id=category_id,
        min_amount=min_amount,
        max_amount=max_amount,
        search=search,
        payment_method=payment_method,
    )

    service = ExpenseService(db)
    return await service.list_expenses(user_id, page, limit, filters)


@router.post("", response_model=DataResponse[ExpenseResponse])
async def create_expense(
    expense: ExpenseCreate,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Create a new expense."""
    service = ExpenseService(db)
    result = await service.create_expense(user_id, expense)
    return DataResponse(data=result, message="Expense created successfully")


@router.get("/{expense_id}", response_model=DataResponse[ExpenseResponse])
async def get_expense(
    expense_id: str,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Get a single expense by ID."""
    service = ExpenseService(db)
    result = await service.get_expense(user_id, expense_id)
    return DataResponse(data=result)


@router.put("/{expense_id}", response_model=DataResponse[ExpenseResponse])
async def update_expense(
    expense_id: str,
    expense: ExpenseUpdate,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Update an expense."""
    service = ExpenseService(db)
    result = await service.update_expense(user_id, expense_id, expense)
    return DataResponse(data=result, message="Expense updated successfully")


@router.delete("/{expense_id}", response_model=DataResponse[dict])
async def delete_expense(
    expense_id: str,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Delete an expense."""
    service = ExpenseService(db)
    await service.delete_expense(user_id, expense_id)
    return DataResponse(data={"id": expense_id}, message="Expense deleted successfully")
