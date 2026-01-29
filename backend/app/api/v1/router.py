from fastapi import APIRouter

from app.api.v1 import expenses, budgets, goals, insights, reports, categories

api_router = APIRouter()

api_router.include_router(
    expenses.router,
    prefix="/expenses",
    tags=["Expenses"]
)

api_router.include_router(
    budgets.router,
    prefix="/budgets",
    tags=["Budgets"]
)

api_router.include_router(
    goals.router,
    prefix="/goals",
    tags=["Goals"]
)

api_router.include_router(
    insights.router,
    prefix="/insights",
    tags=["AI Insights"]
)

api_router.include_router(
    reports.router,
    prefix="/reports",
    tags=["Reports"]
)

api_router.include_router(
    categories.router,
    prefix="/categories",
    tags=["Categories"]
)
