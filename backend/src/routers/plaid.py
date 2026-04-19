from __future__ import annotations

import os
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Header, HTTPException

from backend.db import get_supabase
from backend.src.routers.deps import get_user_id

router = APIRouter(prefix="/api/v1", tags=["plaid"])


def _plaid_client() -> Any:
    try:
        import plaid
        from plaid.api import plaid_api
    except ImportError as exc:
        raise HTTPException(
            status_code=500,
            detail="plaid-python is not installed. Run 'uv sync' from repository root.",
        ) from exc

    client_id = os.getenv("PLAID_CLIENT_ID", "") or os.getenv("PLAID_CLIENT", "")
    secret = os.getenv("PLAID_SECRET", "")
    env = os.getenv("PLAID_ENV", "sandbox").lower()

    if not client_id or not secret:
        raise HTTPException(status_code=500, detail="PLAID_CLIENT_ID (or PLAID_CLIENT) and PLAID_SECRET must be set in backend/.env")

    host = {
        "sandbox": plaid.Environment.Sandbox,
        "development": plaid.Environment.Development,
        "production": plaid.Environment.Production,
    }.get(env, plaid.Environment.Sandbox)

    configuration = plaid.Configuration(
        host=host,
        api_key={"clientId": client_id, "secret": secret},
    )
    api_client = plaid.ApiClient(configuration)
    return plaid_api.PlaidApi(api_client)


def _classify_transaction(merchant: str, amount: float, detailed_category: str) -> tuple[str, str]:
    text = f"{merchant} {detailed_category}".lower()
    if amount < 0:
        return "Income", "Likely payout or incoming transfer"
    if any(token in text for token in ["gas", "fuel", "shell", "chevron", "exxon"]):
        return "Vehicle", "Fuel spend may be deductible with business mileage"
    if any(token in text for token in ["adobe", "canva", "figma", "software", "subscription"]):
        return "Software", "Business software tools are often deductible"
    if any(token in text for token in ["airline", "hotel", "travel", "uber", "lyft", "delta"]):
        return "Travel", "Business travel may be deductible"
    if any(token in text for token in ["restaurant", "meal", "coffee"]):
        return "Meals", "Meals may be partially deductible"
    if any(token in text for token in ["office", "supplies", "best buy", "staples"]):
        return "Supplies", "Business supplies may be deductible"
    return "Uncategorized", "Needs manual review"


def _upsert_transactions(user_id: str, added: list[dict[str, Any]]) -> int:
    sb = get_supabase()
    inserted = 0
    for tx in added:
        plaid_tx_id = str(tx.get("transaction_id"))
        amount = float(tx.get("amount", 0.0))
        merchant = str(tx.get("merchant_name") or tx.get("name") or "Unknown")
        date = str(tx.get("date") or datetime.now(UTC).date())
        detailed_category = str(
            tx.get("personal_finance_category", {}).get("detailed")
            or (tx.get("category", [""])[0] if tx.get("category") else "")
        )
        category, reason = _classify_transaction(merchant, amount, detailed_category)
        tx_type = "income" if amount < 0 else "expense"

        sb.table("transactions").upsert({
            "id": plaid_tx_id,
            "user_id": user_id,
            "date": date,
            "merchant": merchant,
            "amount": abs(amount),
            "type": tx_type,
            "category": category,
            "confidence_score": 0.9 if category != "Uncategorized" else 0.65,
            "source": "bank",
            "notes": reason,
        }).execute()
        inserted += 1
    return inserted


@router.get("/integrations/defaults")
def integration_defaults() -> list[dict[str, Any]]:
    return [
        {"id": "bank", "name": "Bank (Plaid)", "description": "Connect checking and credit accounts for auto transaction sync", "connected": False},
        {"id": "youtube", "name": "YouTube", "description": "Pull AdSense revenue, memberships & sponsorship payouts", "connected": True, "lastSyncAt": "2026-04-11T09:10:00Z"},
        {"id": "paypal", "name": "PayPal", "description": "Sync client payments, invoices & freelance transfers", "connected": True, "lastSyncAt": "2026-04-10T12:00:00Z"},
        {"id": "stripe", "name": "Stripe", "description": "Import card payments, subscriptions & platform payouts", "connected": False},
        {"id": "twitch", "name": "Twitch", "description": "Auto-import subscription, bits & ad revenue", "connected": False},
        {"id": "patreon", "name": "Patreon", "description": "Import tier membership income and platform fees", "connected": False},
    ]


@router.post("/plaid/link-token")
def plaid_link_token(
    payload: dict[str, Any],
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    try:
        from plaid.model.country_code import CountryCode
        from plaid.model.link_token_create_request import LinkTokenCreateRequest
        from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
        from plaid.model.products import Products
    except ImportError as exc:
        raise HTTPException(
            status_code=500,
            detail="plaid-python is not installed. Run 'uv sync' from repository root.",
        ) from exc

    user_id = get_user_id(authorization)
    client = _plaid_client()
    request = LinkTokenCreateRequest(
        products=[Products("transactions")],
        client_name="GigATax",
        country_codes=[CountryCode("US")],
        language="en",
        user=LinkTokenCreateRequestUser(client_user_id=str(payload.get("client_user_id", user_id))),
    )
    response = client.link_token_create(request).to_dict()
    return {"link_token": response.get("link_token"), "expiration": response.get("expiration")}


@router.post("/plaid/exchange")
def plaid_exchange(
    payload: dict[str, Any],
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    try:
        from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
    except ImportError as exc:
        raise HTTPException(
            status_code=500,
            detail="plaid-python is not installed. Run 'uv sync' from repository root.",
        ) from exc

    user_id = get_user_id(authorization)
    client = _plaid_client()
    public_token = str(payload.get("public_token", ""))
    if not public_token:
        raise HTTPException(status_code=400, detail="public_token is required")

    response = client.item_public_token_exchange(ItemPublicTokenExchangeRequest(public_token=public_token)).to_dict()
    item_id = str(response.get("item_id"))
    access_token = str(response.get("access_token"))

    sb = get_supabase()
    sb.table("integrations").upsert({
        "user_id": user_id,
        "integration_id": "bank",
        "name": "Bank (Plaid)",
        "connected": True,
        "last_sync_at": datetime.now(UTC).isoformat(),
    }).execute()

    sb.table("receipts").upsert({
        "id": f"plaid-item-{item_id}",
        "user_id": user_id,
        "merchant": "PLAID_ACCESS_TOKEN",
        "amount": 0,
        "date": datetime.now(UTC).date().isoformat(),
        "category": access_token,
    }).execute()

    return {"item_id": item_id, "request_id": response.get("request_id")}


@router.post("/plaid/sync-all")
def plaid_sync_all(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    try:
        from plaid.model.transactions_sync_request import TransactionsSyncRequest
    except ImportError as exc:
        raise HTTPException(
            status_code=500,
            detail="plaid-python is not installed. Run 'uv sync' from repository root.",
        ) from exc

    user_id = get_user_id(authorization)
    sb = get_supabase()

    token_rows = (
        sb.table("receipts")
        .select("id, category")
        .eq("user_id", user_id)
        .eq("merchant", "PLAID_ACCESS_TOKEN")
        .execute()
        .data
        or []
    )

    client = _plaid_client()
    synced_item_ids: list[str] = []
    total_added = 0

    for row in token_rows:
        access_token = str(row.get("category", ""))
        item_id = str(row.get("id", "")).replace("plaid-item-", "")
        if not access_token:
            continue

        cursor: str | None = None
        has_more = True
        while has_more:
            sync_response = client.transactions_sync(
                TransactionsSyncRequest(access_token=access_token, cursor=cursor)
            ).to_dict()
            added = sync_response.get("added", [])
            total_added += _upsert_transactions(user_id, added)
            cursor = sync_response.get("next_cursor")
            has_more = bool(sync_response.get("has_more", False))

        if item_id:
            synced_item_ids.append(item_id)

    return {"synced_item_ids": synced_item_ids, "total_added": total_added}
