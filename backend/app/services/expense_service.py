from supabase import Client
from app.models.expense import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    ExpenseFilters,
)
from app.models.common import PaginatedResponse
from app.core.exceptions import NotFoundException, BadRequestException


class ExpenseService:
    def __init__(self, db: Client):
        self.db = db

    async def list_expenses(
        self,
        user_id: str,
        page: int,
        limit: int,
        filters: ExpenseFilters,
    ) -> PaginatedResponse[ExpenseResponse]:
        """List expenses with pagination and filters."""
        query = self.db.table("expenses").select(
            "*, category:categories(id, name, icon, color)"
        ).eq("user_id", user_id)

        # Apply filters
        if filters.start_date:
            query = query.gte("date", filters.start_date)
        if filters.end_date:
            query = query.lte("date", filters.end_date)
        if filters.category_id:
            query = query.eq("category_id", filters.category_id)
        if filters.min_amount:
            query = query.gte("amount", filters.min_amount)
        if filters.max_amount:
            query = query.lte("amount", filters.max_amount)
        if filters.payment_method:
            query = query.eq("payment_method", filters.payment_method)
        if filters.search:
            query = query.ilike("description", f"%{filters.search}%")

        # Get total count
        count_query = self.db.table("expenses").select("id", count="exact").eq("user_id", user_id)
        count_result = count_query.execute()
        total = count_result.count or 0

        # Apply pagination
        offset = (page - 1) * limit
        query = query.order("date", desc=True).range(offset, offset + limit - 1)

        result = query.execute()

        return PaginatedResponse(
            data=result.data,
            total=total,
            page=page,
            limit=limit,
            total_pages=(total + limit - 1) // limit if total > 0 else 1,
        )

    async def create_expense(
        self, user_id: str, expense: ExpenseCreate
    ) -> ExpenseResponse:
        """Create a new expense."""
        data = expense.model_dump()
        data["user_id"] = user_id

        result = self.db.table("expenses").insert(data).execute()

        if not result.data:
            raise BadRequestException("Failed to create expense")

        # Fetch with category info
        expense_id = result.data[0]["id"]
        return await self.get_expense(user_id, expense_id)

    async def get_expense(self, user_id: str, expense_id: str) -> ExpenseResponse:
        """Get a single expense."""
        result = (
            self.db.table("expenses")
            .select("*, category:categories(id, name, icon, color)")
            .eq("id", expense_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        if not result.data:
            raise NotFoundException("Expense not found")

        return result.data

    async def update_expense(
        self, user_id: str, expense_id: str, expense: ExpenseUpdate
    ) -> ExpenseResponse:
        """Update an expense."""
        # Check if expense exists
        await self.get_expense(user_id, expense_id)

        # Update only provided fields
        data = expense.model_dump(exclude_unset=True)

        result = (
            self.db.table("expenses")
            .update(data)
            .eq("id", expense_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not result.data:
            raise BadRequestException("Failed to update expense")

        return await self.get_expense(user_id, expense_id)

    async def delete_expense(self, user_id: str, expense_id: str) -> None:
        """Delete an expense."""
        # Check if expense exists
        await self.get_expense(user_id, expense_id)

        self.db.table("expenses").delete().eq("id", expense_id).eq(
            "user_id", user_id
        ).execute()
