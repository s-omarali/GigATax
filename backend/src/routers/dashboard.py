from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Header

from backend.db import get_supabase
from backend.src.routers.deps import get_user_id

router = APIRouter(prefix="/api/v1", tags=["dashboard"])


@router.get("/dashboard")
def get_dashboard(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = get_user_id(authorization)
    sb = get_supabase()

    transactions = sb.table("transactions").select("*").eq("user_id", user_id).execute().data or []
    deductions = sb.table("deductions").select("*").eq("user_id", user_id).execute().data or []
    signals = sb.table("optimization_signals").select("*").eq("user_id", user_id).execute().data or []

    total_income = sum(t["amount"] for t in transactions if t.get("type") == "income")
    total_deductions = sum(d.get("potential_savings", 0) for d in deductions)

    user = sb.table("users").select("estimated_marginal_tax_rate").eq("id", user_id).single().execute().data or {}
    tax_rate = user.get("estimated_marginal_tax_rate", 0.24)
    tax_liability = round(total_income * tax_rate, 2)

    return {
        "metrics": {
            "totalIncome": total_income,
            "estimatedTaxLiability": tax_liability,
            "totalDeductionsFound": total_deductions,
        },
        "transactions": transactions,
        "deductions": deductions,
        "optimizationSignals": signals,
    }
