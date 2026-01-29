from supabase import Client
from datetime import datetime, timedelta
from app.models.budget import BudgetCreate, BudgetUpdate, BudgetResponse, BudgetStatus
from app.core.exceptions import NotFoundException, BadRequestException


class BudgetService:
    def __init__(self, db: Client):
        self.db = db

    async def list_budgets(self, user_id: str) -> list[BudgetResponse]:
        """List all budgets for a user."""
        result = (
            self.db.table("budgets")
            .select("*, category:categories(id, name, icon, color)")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return result.data

    async def create_budget(
        self, user_id: str, budget: BudgetCreate
    ) -> BudgetResponse:
        """Create a new budget."""
        data = budget.model_dump()
        data["user_id"] = user_id

        result = self.db.table("budgets").insert(data).execute()

        if not result.data:
            raise BadRequestException("Failed to create budget")

        budget_id = result.data[0]["id"]
        return await self.get_budget(user_id, budget_id)

    async def get_budget(self, user_id: str, budget_id: str) -> BudgetResponse:
        """Get a single budget."""
        result = (
            self.db.table("budgets")
            .select("*, category:categories(id, name, icon, color)")
            .eq("id", budget_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        if not result.data:
            raise NotFoundException("Budget not found")

        return result.data

    async def update_budget(
        self, user_id: str, budget_id: str, budget: BudgetUpdate
    ) -> BudgetResponse:
        """Update a budget."""
        await self.get_budget(user_id, budget_id)

        data = budget.model_dump(exclude_unset=True)

        result = (
            self.db.table("budgets")
            .update(data)
            .eq("id", budget_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not result.data:
            raise BadRequestException("Failed to update budget")

        return await self.get_budget(user_id, budget_id)

    async def delete_budget(self, user_id: str, budget_id: str) -> None:
        """Delete a budget."""
        await self.get_budget(user_id, budget_id)

        self.db.table("budgets").delete().eq("id", budget_id).eq(
            "user_id", user_id
        ).execute()

    async def get_budget_status(self, user_id: str) -> list[BudgetStatus]:
        """Get budget status with spending info."""
        budgets = await self.list_budgets(user_id)
        result = []

        for budget in budgets:
            # Calculate date range based on period
            start_date, end_date = self._get_period_dates(
                budget["period"], budget["start_date"]
            )

            # Get total spent for this budget's category (or all if overall)
            query = (
                self.db.table("expenses")
                .select("amount")
                .eq("user_id", user_id)
                .gte("date", start_date)
                .lte("date", end_date)
            )

            if budget["category_id"]:
                query = query.eq("category_id", budget["category_id"])

            expenses_result = query.execute()

            spent = sum(e["amount"] for e in expenses_result.data)
            remaining = budget["amount"] - spent
            percentage = (spent / budget["amount"]) * 100 if budget["amount"] > 0 else 0

            result.append(
                BudgetStatus(
                    budget=budget,
                    spent=spent,
                    remaining=remaining,
                    percentage=round(percentage, 2),
                    is_over_budget=spent > budget["amount"],
                    is_near_limit=percentage >= budget["alert_threshold"],
                )
            )

        return result

    def _get_period_dates(self, period: str, start_date: str) -> tuple[str, str]:
        """Get start and end dates for budget period."""
        start = datetime.strptime(start_date, "%Y-%m-%d")
        today = datetime.now()

        if period == "weekly":
            # Find the current week's start based on the original start date
            days_since_start = (today - start).days
            current_period_start = start + timedelta(days=(days_since_start // 7) * 7)
            end = current_period_start + timedelta(days=6)
        elif period == "monthly":
            # Use current month
            current_period_start = today.replace(day=1)
            if today.month == 12:
                end = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                end = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
        else:  # yearly
            current_period_start = today.replace(month=1, day=1)
            end = today.replace(month=12, day=31)

        return current_period_start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")
