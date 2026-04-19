from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Header, HTTPException

from backend.db import get_supabase
from backend.src.routers.deps import get_user_id

router = APIRouter(prefix="/api/v1", tags=["users"])


@router.get("/me")
def get_me(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = get_user_id(authorization)
    result = get_supabase().table("users").select("*").eq("id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User profile not found")
    return result.data
