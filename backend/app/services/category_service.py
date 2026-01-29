from supabase import Client
from app.core.exceptions import NotFoundException, BadRequestException, ForbiddenException


class CategoryService:
    def __init__(self, db: Client):
        self.db = db

    async def list_categories(self, user_id: str) -> list[dict]:
        """List all categories for a user (including defaults)."""
        result = (
            self.db.table("categories")
            .select("*")
            .or_(f"user_id.eq.{user_id},is_default.eq.true")
            .order("is_default", desc=True)
            .order("name")
            .execute()
        )
        return result.data

    async def create_category(self, user_id: str, category) -> dict:
        """Create a custom category."""
        data = category.model_dump()
        data["user_id"] = user_id
        data["is_default"] = False

        # Check if category with same name exists
        existing = (
            self.db.table("categories")
            .select("id")
            .eq("user_id", user_id)
            .eq("name", data["name"])
            .execute()
        )

        if existing.data:
            raise BadRequestException("Category with this name already exists")

        result = self.db.table("categories").insert(data).execute()

        if not result.data:
            raise BadRequestException("Failed to create category")

        return result.data[0]

    async def get_category(self, user_id: str, category_id: str) -> dict:
        """Get a single category."""
        result = (
            self.db.table("categories")
            .select("*")
            .eq("id", category_id)
            .single()
            .execute()
        )

        if not result.data:
            raise NotFoundException("Category not found")

        # Check ownership (only for non-default categories)
        if not result.data["is_default"] and result.data["user_id"] != user_id:
            raise ForbiddenException("You don't have access to this category")

        return result.data

    async def update_category(
        self, user_id: str, category_id: str, category
    ) -> dict:
        """Update a custom category."""
        existing = await self.get_category(user_id, category_id)

        if existing["is_default"]:
            raise ForbiddenException("Cannot modify default categories")

        data = category.model_dump(exclude_unset=True)

        result = (
            self.db.table("categories")
            .update(data)
            .eq("id", category_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not result.data:
            raise BadRequestException("Failed to update category")

        return result.data[0]

    async def delete_category(self, user_id: str, category_id: str) -> None:
        """Delete a custom category."""
        existing = await self.get_category(user_id, category_id)

        if existing["is_default"]:
            raise ForbiddenException("Cannot delete default categories")

        # Check if category is used by any expenses
        expenses = (
            self.db.table("expenses")
            .select("id")
            .eq("category_id", category_id)
            .limit(1)
            .execute()
        )

        if expenses.data:
            raise BadRequestException(
                "Cannot delete category that is used by expenses. "
                "Please reassign or delete those expenses first."
            )

        self.db.table("categories").delete().eq("id", category_id).eq(
            "user_id", user_id
        ).execute()
