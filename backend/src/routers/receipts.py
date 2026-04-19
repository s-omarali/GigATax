from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Header

from backend.db import get_supabase
from backend.src.ai.categorizer import categorize_transaction
from backend.src.routers.deps import get_user_id
from backend.src.schemas.requests import ReceiptScanPayload

router = APIRouter(prefix="/api/v1", tags=["receipts"])


@router.post("/receipts/scan")
def scan_receipt(
    payload: ReceiptScanPayload,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    user_id = get_user_id(authorization)
    sb = get_supabase()

    user = sb.table("users").select("gigs").eq("id", user_id).single().execute().data or {}
    gigs = user.get("gigs", [])

    merchant = payload.merchant or "Scanned Merchant"
    amount = payload.amount or 0.0

    ai = categorize_transaction(merchant, amount, gigs)

    receipt = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "merchant": merchant,
        "amount": amount,
        "date": payload.date or "",
        "category": ai["category"],
    }
    sb.table("receipts").insert(receipt).execute()

    return {
        "merchant": receipt["merchant"],
        "amount": receipt["amount"],
        "date": receipt["date"],
        "suggestedCategory": ai["category"],
        "confidenceScore": ai["confidence_score"],
        "deductible": ai["deductible"],
        "reason": ai["reason"],
    }
