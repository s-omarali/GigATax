from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Header

from backend.db import get_supabase
from backend.src.ai.categorizer import categorize_transaction, discover_deductions
from backend.src.routers.deps import get_user_id
from backend.src.schemas.requests import MileagePayload

router = APIRouter(prefix="/api/v1", tags=["optimization"])

IRS_MILEAGE_RATE = 0.67  # 2025


@router.post("/optimization/mileage")
def optimize_mileage(
    payload: MileagePayload,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    user_id = get_user_id(authorization)
    sb = get_supabase()

    avg_gas_price = 3.20
    estimated_miles = round(payload.gasSpend / avg_gas_price * payload.mpg, 1) if avg_gas_price > 0 else 0
    allowed_deduction = round(payload.businessMiles * IRS_MILEAGE_RATE, 2)
    tax_savings = round(allowed_deduction * 0.24, 2)

    sb.table("deductions").upsert({
        "id": f"{user_id}-mileage",
        "user_id": user_id,
        "title": "Vehicle Mileage Deduction",
        "category": "Vehicle",
        "status": "in_progress",
        "potential_savings": tax_savings,
        "detail": f"{payload.businessMiles} business miles @ ${IRS_MILEAGE_RATE}/mile",
    }).execute()

    return {
        "averageGasPrice": avg_gas_price,
        "estimatedMiles": estimated_miles,
        "allowedDeductionAmount": allowed_deduction,
        "taxSavingsClaimed": tax_savings,
    }


@router.post("/transactions/categorize")
def categorize_transactions(
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    """Categorize all uncategorized transactions for the user using Gemini."""
    user_id = get_user_id(authorization)
    sb = get_supabase()

    user = sb.table("users").select("gigs").eq("id", user_id).single().execute().data or {}
    gigs = user.get("gigs", [])

    transactions = (
        sb.table("transactions")
        .select("id, merchant, amount")
        .eq("user_id", user_id)
        .eq("category", "Uncategorized")
        .execute()
        .data or []
    )

    updated = []
    for tx in transactions:
        ai = categorize_transaction(tx["merchant"], tx["amount"], gigs)
        sb.table("transactions").update({
            "category": ai["category"],
            "confidence_score": ai["confidence_score"],
            "type": ai["type"],
        }).eq("id", tx["id"]).execute()
        updated.append({"id": tx["id"], **ai})

    return {"categorized": len(updated), "results": updated}


@router.post("/optimization/discover")
def discover_deductions_endpoint(
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    """Use Gemini to discover deductions from the user's full transaction history."""
    user_id = get_user_id(authorization)
    sb = get_supabase()

    user = sb.table("users").select("gigs").eq("id", user_id).single().execute().data or {}
    gigs = user.get("gigs", [])

    transactions = (
        sb.table("transactions")
        .select("merchant, amount, category")
        .eq("user_id", user_id)
        .execute()
        .data or []
    )

    deductions = discover_deductions(transactions, gigs)

    saved = []
    for d in deductions:
        deduction_id = f"{user_id}-{d['category'].lower()}-{str(uuid.uuid4())[:8]}"
        sb.table("deductions").upsert({
            "id": deduction_id,
            "user_id": user_id,
            "title": d["title"],
            "category": d["category"],
            "status": "available",
            "potential_savings": d["potential_savings"],
            "detail": d["detail"],
        }).execute()
        saved.append(d)

    return {"discovered": len(saved), "deductions": saved}
