import os
import re
import base64
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from bs4 import BeautifulSoup
from db import get_client

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

AMOUNT_RE = re.compile(r"\$\s*([\d,]+\.?\d{0,2})")
DATE_RE = re.compile(
    r"\b(\d{1,2}/\d{1,2}/\d{2,4}|\w+ \d{1,2},? \d{4}|\d{4}-\d{2}-\d{2})\b"
)
BANK_ALERT_RE = re.compile(
    r"(?:you (?:spent|paid|sent)|charge of|payment of)\s+\$?([\d,]+\.?\d{0,2})\s+(?:at|to)\s+([^\n\.,]{2,50})",
    re.IGNORECASE,
)


def get_oauth_flow() -> Flow:
    return Flow.from_client_config(
        {
            "web": {
                "client_id": os.environ["GMAIL_CLIENT_ID"],
                "client_secret": os.environ["GMAIL_CLIENT_SECRET"],
                "redirect_uris": [os.environ["GMAIL_REDIRECT_URI"]],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=SCOPES,
        redirect_uri=os.environ["GMAIL_REDIRECT_URI"],
    )


def get_auth_url() -> str:
    flow = get_oauth_flow()
    auth_url, _ = flow.authorization_url(prompt="consent", access_type="offline")
    return auth_url


def exchange_code(user_id: str, code: str) -> None:
    flow = get_oauth_flow()
    flow.fetch_token(code=code)
    creds = flow.credentials
    db = get_client()
    db.table("gmail_tokens").upsert({
        "user_id": user_id,
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
    }).execute()


def _get_gmail_service(user_id: str):
    db = get_client()
    result = db.table("gmail_tokens").select("*").eq("user_id", user_id).single().execute()
    if not result.data:
        raise ValueError("Gmail not connected for this user")
    data = result.data
    creds = Credentials(
        token=data["token"],
        refresh_token=data["refresh_token"],
        token_uri=data["token_uri"],
        client_id=data["client_id"],
        client_secret=data["client_secret"],
        scopes=SCOPES,
    )
    return build("gmail", "v1", credentials=creds)


def _decode_body(payload: dict) -> str:
    """Recursively decode email body to plain text."""
    if payload.get("mimeType") == "text/plain":
        data = payload.get("body", {}).get("data", "")
        return base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="ignore")
    if payload.get("mimeType") == "text/html":
        data = payload.get("body", {}).get("data", "")
        html = base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="ignore")
        return BeautifulSoup(html, "lxml").get_text(" ", strip=True)
    for part in payload.get("parts", []):
        text = _decode_body(part)
        if text:
            return text
    return ""


def _extract_expense_from_email(subject: str, body: str, sender: str) -> dict | None:
    text = f"{subject}\n{body}"

    # Try bank alert pattern first
    match = BANK_ALERT_RE.search(text)
    if match:
        amount_str, merchant = match.group(1), match.group(2).strip()
        amount = float(amount_str.replace(",", ""))
        return {"merchant": merchant, "amount": amount, "source": "email", "raw_text": subject}

    # Generic receipt: find amount
    amounts = AMOUNT_RE.findall(text)
    if not amounts:
        return None
    amount = float(max(amounts, key=lambda x: float(x.replace(",", ""))).replace(",", ""))

    # Derive merchant from sender domain or subject
    domain_match = re.search(r"@([\w-]+)\.", sender)
    merchant = domain_match.group(1).title() if domain_match else subject[:40]

    return {"merchant": merchant, "amount": amount, "source": "email", "raw_text": subject}


def fetch_emails(user_id: str, days: int = 30) -> list[dict]:
    service = _get_gmail_service(user_id)
    after = int((datetime.now() - timedelta(days=days)).timestamp())
    query = f"after:{after} (receipt OR invoice OR 'you spent' OR 'payment confirmation' OR 'order confirmation')"

    results = service.users().messages().list(userId="me", q=query, maxResults=100).execute()
    messages = results.get("messages", [])

    expenses = []
    for msg_ref in messages:
        msg = service.users().messages().get(userId="me", id=msg_ref["id"], format="full").execute()
        headers = {h["name"]: h["value"] for h in msg["payload"].get("headers", [])}
        subject = headers.get("Subject", "")
        sender = headers.get("From", "")
        body = _decode_body(msg["payload"])

        expense = _extract_expense_from_email(subject, body, sender)
        if expense:
            expense["user_id"] = user_id
            expense["date"] = datetime.now().date().isoformat()
            expense["category"] = "Other"
            expenses.append(expense)

    if expenses:
        db = get_client()
        db.table("expenses").insert(expenses).execute()

    return expenses
