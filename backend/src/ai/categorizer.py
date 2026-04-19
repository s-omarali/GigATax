from __future__ import annotations

import json
import os
from pathlib import Path

import google.generativeai as genai


def _load_env() -> None:
    env_path = Path(__file__).resolve().parents[2] / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key, value = key.strip(), value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


_load_env()
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
_model = genai.GenerativeModel("gemini-1.5-flash")

VALID_CATEGORIES = [
    "Equipment", "Software", "Travel", "Meals", "HomeOffice",
    "Phone", "Internet", "Marketing", "Education", "Subscriptions",
    "Vehicle", "Supplies", "Income", "Uncategorized",
]


def categorize_transaction(merchant: str, amount: float, gigs: list[str]) -> dict:
    """Returns {category, confidence_score, type, deductible, reason}"""
    gig_str = ", ".join(gigs) if gigs else "freelancer"
    prompt = f"""You are a US tax expert helping gig workers categorize transactions.

User's gig types: {gig_str}
Merchant: {merchant}
Amount: ${amount}

Categorize this transaction and return ONLY valid JSON with these fields:
- category: one of {VALID_CATEGORIES}
- confidence_score: float between 0.0 and 1.0
- type: "income" or "expense"
- deductible: true or false
- reason: one short sentence explaining why

Example:
{{"category": "Software", "confidence_score": 0.95, "type": "expense", "deductible": true, "reason": "Adobe Creative Cloud is a deductible software subscription for content creators."}}"""

    response = _model.generate_content(prompt)
    text = response.text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    result = json.loads(text)

    if result.get("category") not in VALID_CATEGORIES:
        result["category"] = "Uncategorized"
    result["confidence_score"] = max(0.0, min(1.0, float(result.get("confidence_score", 0.5))))
    return result


def discover_deductions(transactions: list[dict], gigs: list[str]) -> list[dict]:
    """Returns list of {title, category, potential_savings, detail}"""
    gig_str = ", ".join(gigs) if gigs else "freelancer"
    tx_summary = "\n".join(
        f"- {t['merchant']}: ${t['amount']} ({t.get('category', 'Uncategorized')})"
        for t in transactions[:50]
    )

    prompt = f"""You are a US tax expert reviewing transactions for a gig worker.

User's gig types: {gig_str}
Transactions:
{tx_summary}

Identify up to 6 specific tax deductions this person is likely missing or underutilizing.
Return ONLY a valid JSON array. Each item must have:
- title: short deduction name
- category: one of {VALID_CATEGORIES}
- potential_savings: estimated annual dollar savings as a number
- detail: one sentence explaining the deduction and how it applies to their gig

Example:
[{{"title": "Phone Bill Deduction", "category": "Phone", "potential_savings": 180, "detail": "50% of your monthly phone bill qualifies as a business expense for content creators."}}]"""

    response = _model.generate_content(prompt)
    text = response.text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(text)
