from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, File, Header, UploadFile

from backend.db import get_supabase
from backend.src.ai.categorizer import categorize_transaction, extract_receipt
from backend.src.routers.deps import get_user_id

router = APIRouter(prefix="/api/v1", tags=["receipts"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"}


def _upload_to_storage(sb, user_id: str, receipt_id: str, file_bytes: bytes, media_type: str) -> str | None:
    ext = {"image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp", "application/pdf": "pdf"}.get(media_type, "bin")
    path = f"{user_id}/{receipt_id}.{ext}"
    try:
        sb.storage.from_("receipts").upload(path, file_bytes, {"content-type": media_type, "upsert": "true"})
        return sb.storage.from_("receipts").get_public_url(path)
    except Exception:
        return None


@router.post("/receipts/scan")
async def scan_receipt(
    file: UploadFile = File(...),
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    user_id = get_user_id(authorization)
    sb = get_supabase()

    user = sb.table("users").select("gigs").eq("id", user_id).single().execute().data or {}
    gigs = user.get("gigs", [])

    media_type = file.content_type or "application/octet-stream"
    if media_type not in ALLOWED_TYPES:
        media_type = "image/jpeg"

    file_bytes = await file.read()
    extracted = extract_receipt(file_bytes, media_type)
    ai = categorize_transaction(extracted["merchant"], extracted["amount"], gigs)

    receipt_id = str(uuid.uuid4())
    file_url = _upload_to_storage(sb, user_id, receipt_id, file_bytes, media_type)

    receipt = {
        "id": receipt_id,
        "user_id": user_id,
        "merchant": extracted["merchant"],
        "amount": extracted["amount"],
        "date": extracted["date"],
        "category": ai["category"],
    }
    sb.table("receipts").insert(receipt).execute()

    # Also insert as a transaction so it shows on the dashboard
    sb.table("transactions").insert({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "merchant": extracted["merchant"],
        "amount": extracted["amount"],
        "date": extracted["date"] or "",
        "type": ai.get("type", "expense"),
        "category": ai["category"],
        "confidence_score": ai["confidence_score"],
        "source": "receipt",
        "notes": file_url,
    }).execute()

    return {
        "merchant": receipt["merchant"],
        "amount": receipt["amount"],
        "date": receipt["date"],
        "suggestedCategory": ai["category"],
        "confidenceScore": ai["confidence_score"],
        "deductible": ai["deductible"],
        "reason": ai["reason"],
        "fileUrl": file_url,
    }
