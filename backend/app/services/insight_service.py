from supabase import Client
from datetime import datetime, timedelta
import uuid

from app.models.insight import (
    SpendingSummary,
    CategorySpending,
    SpendingComparison,
    AIInsight,
    ChatMessage,
    ChatResponse,
    SpendingPrediction,
    PredictionBreakdown,
)
from app.core.gemini import generate_insight, chat_with_ai


class InsightService:
    def __init__(self, db: Client):
        self.db = db

    async def get_spending_summary(
        self, user_id: str, period: str = "month"
    ) -> SpendingSummary:
        """Get spending summary for the specified period."""
        start_date, end_date = self._get_period_dates(period)
        prev_start, prev_end = self._get_previous_period_dates(period)

        # Get current period expenses
        current_expenses = (
            self.db.table("expenses")
            .select("*, category:categories(id, name, color)")
            .eq("user_id", user_id)
            .gte("date", start_date)
            .lte("date", end_date)
            .execute()
        ).data

        # Get previous period expenses for comparison
        previous_expenses = (
            self.db.table("expenses")
            .select("amount")
            .eq("user_id", user_id)
            .gte("date", prev_start)
            .lte("date", prev_end)
            .execute()
        ).data

        # Calculate totals
        total_spent = sum(e["amount"] for e in current_expenses)
        previous_spent = sum(e["amount"] for e in previous_expenses)

        # Calculate category breakdown
        category_totals = {}
        for expense in current_expenses:
            cat_id = expense["category_id"]
            if cat_id not in category_totals:
                category_totals[cat_id] = {
                    "category_id": cat_id,
                    "category_name": expense["category"]["name"] if expense["category"] else "Unknown",
                    "category_color": expense["category"]["color"] if expense["category"] else "#6b7280",
                    "amount": 0,
                    "transaction_count": 0,
                }
            category_totals[cat_id]["amount"] += expense["amount"]
            category_totals[cat_id]["transaction_count"] += 1

        # Calculate percentages and sort
        top_categories = []
        for cat in category_totals.values():
            cat["percentage"] = round((cat["amount"] / total_spent) * 100, 2) if total_spent > 0 else 0
            top_categories.append(CategorySpending(**cat))

        top_categories.sort(key=lambda x: x.amount, reverse=True)

        # Calculate comparison
        change_percentage = 0
        if previous_spent > 0:
            change_percentage = round(((total_spent - previous_spent) / previous_spent) * 100, 2)

        trend = "stable"
        if change_percentage > 5:
            trend = "up"
        elif change_percentage < -5:
            trend = "down"

        return SpendingSummary(
            total_spent=total_spent,
            total_income=0,  # Would need income tracking
            net_balance=-total_spent,
            top_categories=top_categories[:5],
            comparison=SpendingComparison(
                previous_period=previous_spent,
                change_percentage=change_percentage,
                trend=trend,
            ),
        )

    async def get_spending_tips(self, user_id: str) -> list[AIInsight]:
        """Get AI-generated spending tips."""
        summary = await self.get_spending_summary(user_id, "month")

        # Build context for AI
        context = f"""
        User's monthly spending summary:
        - Total spent: ${summary.total_spent:.2f}
        - Top categories: {', '.join([f'{c.category_name}: ${c.amount:.2f}' for c in summary.top_categories])}
        - Spending trend compared to last month: {summary.comparison.trend} ({summary.comparison.change_percentage}%)
        """

        prompt = f"""
        Based on this financial data, provide 3-4 personalized, actionable tips to help the user improve their financial health.

        {context}

        Format each tip as:
        - Type: tip/warning/achievement
        - Title: Brief title (max 50 chars)
        - Description: Helpful advice (max 150 chars)
        - Priority: low/medium/high

        Return tips as a simple list, one per line.
        """

        try:
            response = await generate_insight(prompt)
            tips = self._parse_tips(response)
        except Exception:
            # Fallback tips if AI fails
            tips = [
                AIInsight(
                    id=str(uuid.uuid4()),
                    type="tip",
                    title="Track Daily Expenses",
                    description="Recording expenses daily helps identify spending patterns and areas to save.",
                    priority="medium",
                    created_at=datetime.now(),
                ),
                AIInsight(
                    id=str(uuid.uuid4()),
                    type="tip",
                    title="Set Category Budgets",
                    description="Create budgets for your top spending categories to stay on track.",
                    priority="high",
                    created_at=datetime.now(),
                ),
            ]

        return tips

    async def chat(
        self, user_id: str, message: str, history: list[ChatMessage]
    ) -> ChatResponse:
        """Chat with AI about finances."""
        summary = await self.get_spending_summary(user_id, "month")

        context = f"""
        User's financial snapshot:
        - Monthly spending: ${summary.total_spent:.2f}
        - Top expense categories: {', '.join([f'{c.category_name}: ${c.amount:.2f}' for c in summary.top_categories[:3]])}
        - Spending trend: {summary.comparison.trend} ({summary.comparison.change_percentage}% vs last month)
        """

        messages = [{"role": m.role, "content": m.content} for m in history]
        messages.append({"role": "user", "content": message})

        response = await chat_with_ai(messages, context)

        return ChatResponse(
            message=response,
            timestamp=datetime.now(),
        )

    async def get_predictions(self, user_id: str) -> SpendingPrediction:
        """Get spending predictions for next month."""
        # Get last 3 months of data for prediction
        today = datetime.now()
        three_months_ago = today - timedelta(days=90)

        expenses = (
            self.db.table("expenses")
            .select("*, category:categories(id, name)")
            .eq("user_id", user_id)
            .gte("date", three_months_ago.strftime("%Y-%m-%d"))
            .execute()
        ).data

        # Calculate average monthly spending
        total = sum(e["amount"] for e in expenses)
        monthly_average = total / 3 if total > 0 else 0

        # Calculate by category
        category_totals = {}
        for expense in expenses:
            cat_id = expense["category_id"]
            if cat_id not in category_totals:
                category_totals[cat_id] = {
                    "category_id": cat_id,
                    "category_name": expense["category"]["name"] if expense["category"] else "Unknown",
                    "total": 0,
                }
            category_totals[cat_id]["total"] += expense["amount"]

        breakdown = [
            PredictionBreakdown(
                category_id=cat["category_id"],
                category_name=cat["category_name"],
                predicted_amount=round(cat["total"] / 3, 2),
            )
            for cat in category_totals.values()
        ]

        next_month = (today.replace(day=1) + timedelta(days=32)).replace(day=1)

        return SpendingPrediction(
            period=next_month.strftime("%B %Y"),
            predicted_amount=round(monthly_average, 2),
            confidence=0.75,  # Simplified confidence
            breakdown=sorted(breakdown, key=lambda x: x.predicted_amount, reverse=True),
        )

    def _get_period_dates(self, period: str) -> tuple[str, str]:
        """Get start and end dates for period."""
        today = datetime.now()

        if period == "week":
            start = today - timedelta(days=today.weekday())
            end = start + timedelta(days=6)
        elif period == "month":
            start = today.replace(day=1)
            if today.month == 12:
                end = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                end = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
        else:  # year
            start = today.replace(month=1, day=1)
            end = today.replace(month=12, day=31)

        return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")

    def _get_previous_period_dates(self, period: str) -> tuple[str, str]:
        """Get previous period dates for comparison."""
        today = datetime.now()

        if period == "week":
            start = today - timedelta(days=today.weekday() + 7)
            end = start + timedelta(days=6)
        elif period == "month":
            if today.month == 1:
                start = today.replace(year=today.year - 1, month=12, day=1)
            else:
                start = today.replace(month=today.month - 1, day=1)
            end = today.replace(day=1) - timedelta(days=1)
        else:  # year
            start = today.replace(year=today.year - 1, month=1, day=1)
            end = today.replace(year=today.year - 1, month=12, day=31)

        return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")

    def _parse_tips(self, response: str) -> list[AIInsight]:
        """Parse AI response into tips (simplified parser)."""
        tips = []
        lines = response.strip().split("\n")

        current_tip = {}
        for line in lines:
            line = line.strip()
            if line.startswith("- Type:") or line.startswith("Type:"):
                if current_tip:
                    tips.append(self._create_tip(current_tip))
                current_tip = {"type": line.split(":")[-1].strip().lower()}
            elif line.startswith("- Title:") or line.startswith("Title:"):
                current_tip["title"] = line.split(":", 1)[-1].strip()
            elif line.startswith("- Description:") or line.startswith("Description:"):
                current_tip["description"] = line.split(":", 1)[-1].strip()
            elif line.startswith("- Priority:") or line.startswith("Priority:"):
                current_tip["priority"] = line.split(":")[-1].strip().lower()

        if current_tip:
            tips.append(self._create_tip(current_tip))

        return tips[:4]  # Max 4 tips

    def _create_tip(self, data: dict) -> AIInsight:
        """Create AIInsight from parsed data."""
        return AIInsight(
            id=str(uuid.uuid4()),
            type=data.get("type", "tip") if data.get("type") in ["tip", "warning", "achievement", "prediction"] else "tip",
            title=data.get("title", "Financial Tip")[:50],
            description=data.get("description", "Review your spending habits.")[:150],
            priority=data.get("priority", "medium") if data.get("priority") in ["low", "medium", "high"] else "medium",
            created_at=datetime.now(),
        )
