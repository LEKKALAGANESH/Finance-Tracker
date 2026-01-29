from supabase import create_client, Client
from functools import lru_cache

from app.config import get_settings


@lru_cache()
def get_supabase_client() -> Client:
    """Get Supabase client instance (singleton)."""
    settings = get_settings()
    return create_client(
        settings.supabase_url,
        settings.supabase_service_key
    )


def get_db() -> Client:
    """Dependency to get Supabase client."""
    return get_supabase_client()
