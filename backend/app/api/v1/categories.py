from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Literal

from app.api.deps import get_current_user_id, get_db_client
from app.models.common import DataResponse
from app.services.category_service import CategoryService

router = APIRouter()


class CategoryCreate(BaseModel):
    """Create category model."""

    name: str = Field(max_length=30)
    icon: str
    color: str
    type: Literal["expense", "income"]


class CategoryUpdate(BaseModel):
    """Update category model."""

    name: str | None = Field(default=None, max_length=30)
    icon: str | None = None
    color: str | None = None


class CategoryResponse(BaseModel):
    """Category response model."""

    id: str
    user_id: str
    name: str
    icon: str
    color: str
    type: str
    is_default: bool
    created_at: str


@router.get("", response_model=DataResponse[list[CategoryResponse]])
async def list_categories(
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """List all categories for the current user (including defaults)."""
    service = CategoryService(db)
    result = await service.list_categories(user_id)
    return DataResponse(data=result)


@router.post("", response_model=DataResponse[CategoryResponse])
async def create_category(
    category: CategoryCreate,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Create a custom category."""
    service = CategoryService(db)
    result = await service.create_category(user_id, category)
    return DataResponse(data=result, message="Category created successfully")


@router.put("/{category_id}", response_model=DataResponse[CategoryResponse])
async def update_category(
    category_id: str,
    category: CategoryUpdate,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Update a custom category."""
    service = CategoryService(db)
    result = await service.update_category(user_id, category_id, category)
    return DataResponse(data=result, message="Category updated successfully")


@router.delete("/{category_id}", response_model=DataResponse[dict])
async def delete_category(
    category_id: str,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Delete a custom category."""
    service = CategoryService(db)
    await service.delete_category(user_id, category_id)
    return DataResponse(
        data={"id": category_id}, message="Category deleted successfully"
    )
