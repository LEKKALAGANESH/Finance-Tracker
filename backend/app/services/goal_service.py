from supabase import Client
from app.models.goal import GoalCreate, GoalUpdate, GoalResponse, ContributionCreate
from app.core.exceptions import NotFoundException, BadRequestException


class GoalService:
    def __init__(self, db: Client):
        self.db = db

    async def list_goals(self, user_id: str) -> list[GoalResponse]:
        """List all goals for a user."""
        result = (
            self.db.table("goals")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return result.data

    async def create_goal(self, user_id: str, goal: GoalCreate) -> GoalResponse:
        """Create a new goal."""
        data = goal.model_dump()
        data["user_id"] = user_id
        data["current_amount"] = 0
        data["status"] = "active"

        result = self.db.table("goals").insert(data).execute()

        if not result.data:
            raise BadRequestException("Failed to create goal")

        return result.data[0]

    async def get_goal(self, user_id: str, goal_id: str) -> GoalResponse:
        """Get a single goal."""
        result = (
            self.db.table("goals")
            .select("*")
            .eq("id", goal_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        if not result.data:
            raise NotFoundException("Goal not found")

        return result.data

    async def update_goal(
        self, user_id: str, goal_id: str, goal: GoalUpdate
    ) -> GoalResponse:
        """Update a goal."""
        await self.get_goal(user_id, goal_id)

        data = goal.model_dump(exclude_unset=True)

        result = (
            self.db.table("goals")
            .update(data)
            .eq("id", goal_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not result.data:
            raise BadRequestException("Failed to update goal")

        return result.data[0]

    async def delete_goal(self, user_id: str, goal_id: str) -> None:
        """Delete a goal."""
        await self.get_goal(user_id, goal_id)

        self.db.table("goals").delete().eq("id", goal_id).eq(
            "user_id", user_id
        ).execute()

    async def add_contribution(
        self, user_id: str, goal_id: str, contribution: ContributionCreate
    ) -> GoalResponse:
        """Add a contribution to a goal."""
        goal = await self.get_goal(user_id, goal_id)

        if goal["status"] != "active":
            raise BadRequestException("Cannot add contribution to inactive goal")

        new_amount = goal["current_amount"] + contribution.amount

        # Check if goal is completed
        status = "completed" if new_amount >= goal["target_amount"] else "active"

        # Update goal
        result = (
            self.db.table("goals")
            .update({"current_amount": new_amount, "status": status})
            .eq("id", goal_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not result.data:
            raise BadRequestException("Failed to add contribution")

        return result.data[0]
