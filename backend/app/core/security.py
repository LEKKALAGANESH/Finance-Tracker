from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.supabase import get_supabase_client

security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> dict:
    """Verify JWT token and return current user."""
    token = credentials.credentials

    try:
        supabase = get_supabase_client()

        # Verify the token with Supabase
        response = supabase.auth.get_user(token)

        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )

        return {
            "id": response.user.id,
            "email": response.user.email,
            "user_metadata": response.user.user_metadata,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
        )


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Security(security_optional),
) -> dict | None:
    """Get current user if authenticated, None otherwise."""
    if not credentials:
        return None

    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
