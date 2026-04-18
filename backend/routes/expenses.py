from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.expense import ExpenseCreate, ExpenseUpdate, CategoryRuleCreate, CATEGORIES
from services.ai_categorizer import categorize_batch
from services.rules_engine import apply_rules, add_rule, delete_rule, get_rules
from db import get_client

router = APIRouter()
DEMO_USER_ID = "demo-user"


@router.get("/")
def list_expenses(user_id: str = DEMO_USER_ID, category: str | None = None):
    db = get_client()
    query = db.table("expenses").select("*").eq("user_id", user_id).order("date", desc=True)
    if category:
        query = query.eq("category", category)
    result = query.execute()
    return result.data or []


@router.post("/")
def create_expense(body: ExpenseCreate, user_id: str = DEMO_USER_ID):
    db = get_client()
    rule_category = apply_rules(body.merchant, user_id)
    data = body.model_dump()
    data["user_id"] = user_id
    if rule_category:
        data["category"] = rule_category
        data["confidence"] = 1.0
    result = db.table("expenses").insert(data).execute()
    return result.data[0]


@router.patch("/{expense_id}")
def update_expense(expense_id: str, body: ExpenseUpdate, user_id: str = DEMO_USER_ID):
    db = get_client()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = db.table("expenses").update(updates).eq("id", expense_id).eq("user_id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Expense not found")
    return result.data[0]


@router.delete("/{expense_id}")
def delete_expense(expense_id: str, user_id: str = DEMO_USER_ID):
    db = get_client()
    db.table("expenses").delete().eq("id", expense_id).eq("user_id", user_id).execute()
    return {"deleted": expense_id}


@router.post("/categorize-all")
async def categorize_all(user_id: str = DEMO_USER_ID):
    db = get_client()
    result = db.table("expenses").select("*").eq("user_id", user_id).in_("category", ["Other", ""]).execute()
    expenses = result.data or []
    if not expenses:
        return {"updated": 0}

    # Apply rules first, then AI for the rest
    needs_ai = []
    for expense in expenses:
        rule_cat = apply_rules(expense["merchant"], user_id)
        if rule_cat:
            db.table("expenses").update({"category": rule_cat, "confidence": 1.0}).eq("id", expense["id"]).execute()
        else:
            needs_ai.append(expense)

    if needs_ai:
        updated = await categorize_batch(needs_ai)
        for expense in updated:
            db.table("expenses").update({
                "category": expense["category"],
                "confidence": expense.get("confidence"),
            }).eq("id", expense["id"]).execute()

    return {"updated": len(expenses)}


@router.get("/categories")
def list_categories():
    return {"categories": CATEGORIES}


@router.get("/rules")
def list_rules(user_id: str = DEMO_USER_ID):
    return get_rules(user_id)


@router.post("/rules")
def create_rule(body: CategoryRuleCreate, user_id: str = DEMO_USER_ID):
    return add_rule(user_id, body.pattern, body.category)


@router.delete("/rules/{rule_id}")
def remove_rule(rule_id: str):
    delete_rule(rule_id)
    return {"deleted": rule_id}


@router.post("/seed-demo")
def seed_demo_data(user_id: str = DEMO_USER_ID):
    """Seed realistic demo transactions for hackathon presentation."""
    from datetime import date, timedelta
    import random

    demo_expenses = [
        {"merchant": "AWS", "amount": 142.50, "source": "email", "category": "Software / SaaS"},
        {"merchant": "Notion", "amount": 16.00, "source": "email", "category": "Software / SaaS"},
        {"merchant": "Masjid Al-Rahman", "amount": 200.00, "source": "venmo", "category": "Sadaqah"},
        {"merchant": "Launchpad Coffee", "amount": 8.75, "source": "plaid", "category": "Food & Dining"},
        {"merchant": "Islamic Relief USA", "amount": 50.00, "source": "email", "category": "Sadaqah"},
        {"merchant": "Delta Airlines", "amount": 389.00, "source": "plaid", "category": "Travel"},
        {"merchant": "Uber", "amount": 24.50, "source": "plaid", "category": "Travel"},
        {"merchant": "Canva Pro", "amount": 12.99, "source": "email", "category": "Marketing"},
        {"merchant": "Office Depot", "amount": 67.30, "source": "plaid", "category": "Business Expense"},
        {"merchant": "Zakat Foundation", "amount": 500.00, "source": "venmo", "category": "Zakat"},
        {"merchant": "Google Ads", "amount": 250.00, "source": "email", "category": "Marketing"},
        {"merchant": "FedEx", "amount": 18.40, "source": "plaid", "category": "Business Expense"},
    ]

    today = date.today()
    records = []
    for i, e in enumerate(demo_expenses):
        records.append({
            **e,
            "user_id": user_id,
            "date": str(today - timedelta(days=i * 3)),
            "confidence": 0.95,
        })

    db = get_client()
    db.table("expenses").insert(records).execute()
    return {"seeded": len(records)}
