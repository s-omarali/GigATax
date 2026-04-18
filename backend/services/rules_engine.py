from db import get_client


def get_rules(user_id: str) -> list[dict]:
    db = get_client()
    result = db.table("category_rules").select("*").eq("user_id", user_id).execute()
    return result.data or []


def apply_rules(merchant: str, user_id: str) -> str | None:
    """Return matched category or None if no rule matches."""
    rules = get_rules(user_id)
    merchant_lower = merchant.lower()
    for rule in rules:
        if rule["pattern"].lower() in merchant_lower:
            return rule["category"]
    return None


def add_rule(user_id: str, pattern: str, category: str) -> dict:
    db = get_client()
    result = db.table("category_rules").insert({
        "user_id": user_id,
        "pattern": pattern,
        "category": category,
    }).execute()
    return result.data[0]


def delete_rule(rule_id: str) -> None:
    db = get_client()
    db.table("category_rules").delete().eq("id", rule_id).execute()
