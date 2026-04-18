import os
from datetime import datetime, timedelta
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid import Configuration, ApiClient, Environment
from db import get_client

_plaid_client: plaid_api.PlaidApi | None = None


def get_plaid_client() -> plaid_api.PlaidApi:
    global _plaid_client
    if _plaid_client is None:
        env = os.environ.get("PLAID_ENV", "sandbox")
        host = {
            "sandbox": Environment.Sandbox,
            "development": Environment.Development,
            "production": Environment.Production,
        }[env]
        config = Configuration(
            host=host,
            api_key={
                "clientId": os.environ["PLAID_CLIENT_ID"],
                "secret": os.environ["PLAID_SECRET"],
            },
        )
        _plaid_client = plaid_api.PlaidApi(ApiClient(config))
    return _plaid_client


def create_link_token(user_id: str) -> str:
    client = get_plaid_client()
    request = LinkTokenCreateRequest(
        user=LinkTokenCreateRequestUser(client_user_id=user_id),
        client_name="HackMSA Expense Tracker",
        products=[Products("transactions")],
        country_codes=[CountryCode("US")],
        language="en",
    )
    response = client.link_token_create(request)
    return response["link_token"]


def exchange_public_token(user_id: str, public_token: str) -> str:
    client = get_plaid_client()
    request = ItemPublicTokenExchangeRequest(public_token=public_token)
    response = client.item_public_token_exchange(request)
    access_token = response["access_token"]

    # Store access token in Supabase
    db = get_client()
    db.table("plaid_tokens").upsert({
        "user_id": user_id,
        "access_token": access_token,
    }).execute()

    return access_token


def fetch_transactions(user_id: str, days: int = 90) -> list[dict]:
    db = get_client()
    result = db.table("plaid_tokens").select("access_token").eq("user_id", user_id).single().execute()
    if not result.data:
        return []

    access_token = result.data["access_token"]
    client = get_plaid_client()

    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days)

    request = TransactionsGetRequest(
        access_token=access_token,
        start_date=start_date,
        end_date=end_date,
        options=TransactionsGetRequestOptions(count=500),
    )
    response = client.transactions_get(request)

    expenses = []
    for txn in response["transactions"]:
        if txn["amount"] <= 0:
            continue
        expense = {
            "user_id": user_id,
            "source": "plaid",
            "merchant": txn.get("merchant_name") or txn["name"],
            "amount": float(txn["amount"]),
            "date": str(txn["date"]),
            "category": "Other",
            "raw_text": txn["name"],
        }
        expenses.append(expense)

    # Upsert into Supabase expenses table
    if expenses:
        db.table("expenses").upsert(expenses).execute()

    return expenses
