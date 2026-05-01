from __future__ import annotations

import os

from fastapi import APIRouter, HTTPException

from backend.src.schemas.requests import AccessVerifyPayload

router = APIRouter(prefix="/api/v1", tags=["access"])


@router.post("/access/verify")
async def verify_access(payload: AccessVerifyPayload) -> dict[str, bool]:
    expected = os.environ.get("ACCESS_CODE", "")
    if not expected or payload.code != expected:
        raise HTTPException(status_code=401, detail="Invalid access code")
    return {"ok": True}
