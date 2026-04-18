from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from services.email_parser import get_auth_url, exchange_code, fetch_emails

router = APIRouter()
DEMO_USER_ID = "demo-user"


@router.get("/auth")
def gmail_auth():
    url = get_auth_url()
    return {"auth_url": url}


@router.get("/callback")
def gmail_callback(code: str, user_id: str = DEMO_USER_ID):
    try:
        exchange_code(user_id, code)
        return {"success": True, "message": "Gmail connected successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sync")
def sync_emails(user_id: str = DEMO_USER_ID, days: int = 30):
    try:
        expenses = fetch_emails(user_id, days)
        return {"synced": len(expenses), "expenses": expenses}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
