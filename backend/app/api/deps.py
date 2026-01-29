from fastapi import Depends
from supabase import Client

from app.core.supabase import get_db
from app.core.security import get_current_user


async def get_current_user_id(user: dict = Depends(get_current_user)) -> str:
    """Get current user ID from authenticated user."""
    return user["id"]


async def get_db_client() -> Client:
    """Get database client."""
    return get_db()
