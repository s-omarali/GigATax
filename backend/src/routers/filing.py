from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Header

from backend.db import get_supabase
from backend.src.routers.deps import get_user_id
from backend.src.schemas.requests import FilingPreparationPayload, FilingRunPayload

router = APIRouter(prefix="/api/v1", tags=["filing"])


@router.post("/filing/preparation")
def save_filing_preparation(
    payload: FilingPreparationPayload,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    user_id = get_user_id(authorization)
    sb = get_supabase()

    sb.table("filing_profiles").upsert({
        "user_id": user_id,
        "legal_name": payload.legalName,
        "ssn_last4": payload.ssnLast4,
        "filing_status": payload.filingStatus,
        "dependents": payload.dependents,
        "address1": payload.address1,
        "city": payload.city,
        "state": payload.state,
        "zip_code": payload.zipCode,
    }).execute()

    return {"saved": True, "profile": payload.model_dump()}


@router.post("/filing/runs")
def start_filing_run(
    payload: FilingRunPayload,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    user_id = get_user_id(authorization)
    sb = get_supabase()

    run_id = str(uuid.uuid4())
    steps = [
        {"id": "personal_info", "label": "Personal Information", "status": "ready_for_approval", "preview": []},
        {"id": "income", "label": "Income", "status": "pending", "preview": []},
        {"id": "deductions", "label": "Deductions", "status": "pending", "preview": []},
        {"id": "review", "label": "Final Review", "status": "pending", "preview": []},
    ]

    sb.table("filing_runs").insert({
        "run_id": run_id,
        "user_id": user_id,
        "provider": payload.provider,
        "status": "awaiting_user",
        "current_step_index": 0,
        "steps": steps,
    }).execute()

    return {
        "runId": run_id,
        "status": "awaiting_user",
        "provider": payload.provider,
        "currentStepIndex": 0,
        "steps": steps,
    }
