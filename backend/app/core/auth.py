from fastapi import Header, HTTPException, status
from app.infrastructure.supabase.client import SupabaseClient
from functools import lru_cache


@lru_cache
def get_supabase():
    return SupabaseClient()


async def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    token = authorization.split(" ")[1]
    supabase = get_supabase()
    
    try:
        user = supabase.client.auth.get_user(token)
        if not user.user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return user.user
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
