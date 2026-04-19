from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Header, HTTPException

from backend.db import get_supabase
from backend.src.routers.deps import get_auth_user

router = APIRouter(prefix="/api/v1", tags=["users"])


@router.get("/me")
def get_me(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    auth_user = get_auth_user(authorization)
    user_id = auth_user.id
    sb = get_supabase()

    result = sb.table("users").select("*").eq("id", user_id).limit(1).execute().data or []
    if result:
        return result[0]

    sb.table("users").upsert(
        {
            "id": user_id,
            "email": auth_user.email,
            "full_name": auth_user.user_metadata.get("full_name", ""),
            "gigs": [],
            "state": "CA",
            "estimated_marginal_tax_rate": 0.24,
            "onboarding_completed": False,
        }
    ).execute()

    created = sb.table("users").select("*").eq("id", user_id).single().execute().data
    if not created:
        raise HTTPException(status_code=500, detail="Failed to provision user profile")
    return created
