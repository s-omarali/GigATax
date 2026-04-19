from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Header

from backend.db import get_supabase
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
