from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.plaid_service import create_link_token, exchange_public_token, fetch_transactions

router = APIRouter()

DEMO_USER_ID = "demo-user"


class ExchangeRequest(BaseModel):
    public_token: str
    user_id: str = DEMO_USER_ID


@router.post("/link-token")
def get_link_token(user_id: str = DEMO_USER_ID):
    try:
        token = create_link_token(user_id)
        return {"link_token": token}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/exchange")
def exchange_token(body: ExchangeRequest):
    try:
        access_token = exchange_public_token(body.user_id, body.public_token)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/transactions")
def sync_transactions(user_id: str = DEMO_USER_ID, days: int = 90):
    try:
        expenses = fetch_transactions(user_id, days)
        return {"synced": len(expenses), "expenses": expenses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
