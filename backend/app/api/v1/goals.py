from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id, get_db_client
from app.models.goal import (
    GoalCreate,
    GoalUpdate,
    GoalResponse,
    ContributionCreate,
    ContributionResponse,
)
from app.models.common import DataResponse
from app.services.goal_service import GoalService

router = APIRouter()


@router.get("", response_model=DataResponse[list[GoalResponse]])
async def list_goals(
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """List all goals for the current user."""
    service = GoalService(db)
    result = await service.list_goals(user_id)
    return DataResponse(data=result)


@router.post("", response_model=DataResponse[GoalResponse])
async def create_goal(
    goal: GoalCreate,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Create a new goal."""
    service = GoalService(db)
    result = await service.create_goal(user_id, goal)
    return DataResponse(data=result, message="Goal created successfully")


@router.put("/{goal_id}", response_model=DataResponse[GoalResponse])
async def update_goal(
    goal_id: str,
    goal: GoalUpdate,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Update a goal."""
    service = GoalService(db)
    result = await service.update_goal(user_id, goal_id, goal)
    return DataResponse(data=result, message="Goal updated successfully")


@router.delete("/{goal_id}", response_model=DataResponse[dict])
async def delete_goal(
    goal_id: str,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Delete a goal."""
    service = GoalService(db)
    await service.delete_goal(user_id, goal_id)
    return DataResponse(data={"id": goal_id}, message="Goal deleted successfully")


@router.post("/{goal_id}/contribute", response_model=DataResponse[GoalResponse])
async def add_contribution(
    goal_id: str,
    contribution: ContributionCreate,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Add a contribution to a goal."""
    service = GoalService(db)
    result = await service.add_contribution(user_id, goal_id, contribution)
    return DataResponse(data=result, message="Contribution added successfully")
