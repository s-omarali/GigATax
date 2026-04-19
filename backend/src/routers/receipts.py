from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Header

from backend.db import get_supabase
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

    hint = payload.fileName.lower()
    suggested_category = "Travel" if "uber" in hint or "lyft" in hint else "Supplies"

    receipt = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "merchant": payload.merchant or "Scanned Merchant",
        "amount": payload.amount or 0.0,
        "date": payload.date or "",
        "category": payload.suggestedCategory or suggested_category,
    }
    sb.table("receipts").insert(receipt).execute()

    return {
        "merchant": receipt["merchant"],
        "amount": receipt["amount"],
        "date": receipt["date"],
        "suggestedCategory": receipt["category"],
    }
