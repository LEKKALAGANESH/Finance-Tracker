from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id, get_db_client
from app.models.budget import BudgetCreate, BudgetUpdate, BudgetResponse, BudgetStatus
from app.models.common import DataResponse
from app.services.budget_service import BudgetService

router = APIRouter()


@router.get("", response_model=DataResponse[list[BudgetResponse]])
async def list_budgets(
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """List all budgets for the current user."""
    service = BudgetService(db)
    result = await service.list_budgets(user_id)
    return DataResponse(data=result)


@router.post("", response_model=DataResponse[BudgetResponse])
async def create_budget(
    budget: BudgetCreate,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Create a new budget."""
    service = BudgetService(db)
    result = await service.create_budget(user_id, budget)
    return DataResponse(data=result, message="Budget created successfully")


@router.put("/{budget_id}", response_model=DataResponse[BudgetResponse])
async def update_budget(
    budget_id: str,
    budget: BudgetUpdate,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Update a budget."""
    service = BudgetService(db)
    result = await service.update_budget(user_id, budget_id, budget)
    return DataResponse(data=result, message="Budget updated successfully")


@router.delete("/{budget_id}", response_model=DataResponse[dict])
async def delete_budget(
    budget_id: str,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Delete a budget."""
    service = BudgetService(db)
    await service.delete_budget(user_id, budget_id)
    return DataResponse(data={"id": budget_id}, message="Budget deleted successfully")


@router.get("/status", response_model=DataResponse[list[BudgetStatus]])
async def get_budget_status(
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Get budget status with spending info for all budgets."""
    service = BudgetService(db)
    result = await service.get_budget_status(user_id)
    return DataResponse(data=result)
