from __future__ import annotations

from fastapi import APIRouter

from backend.db import get_supabase
from backend.src.schemas.requests import WaitlistJoinPayload

router = APIRouter(prefix="/api/v1", tags=["waitlist"])


@router.post("/waitlist")
async def join_waitlist(payload: WaitlistJoinPayload) -> dict[str, str]:
    db = get_supabase()
    existing = db.table("waitlist_users").select("email").eq("email", payload.email).execute()
    if existing.data:
        return {"message": "You're already on the waitlist."}
    db.table("waitlist_users").insert({"email": payload.email}).execute()
    return {"message": "Successfully joined the waitlist!"}
