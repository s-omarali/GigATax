from __future__ import annotations

import base64
import json
import os
from pathlib import Path

import anthropic


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
_client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

def extract_receipt(file_bytes: bytes, media_type: str) -> dict:
    """Use Claude vision to extract merchant, amount, and date from a receipt image or PDF."""
    b64 = base64.standard_b64encode(file_bytes).decode("utf-8")

    if media_type == "application/pdf":
        source = {"type": "base64", "media_type": "application/pdf", "data": b64}
        content_block = {"type": "document", "source": source}
    else:
        source = {"type": "base64", "media_type": media_type, "data": b64}
        content_block = {"type": "image", "source": source}

    create_kwargs: dict = dict(
        model="claude-sonnet-4-6",
        max_tokens=256,
        messages=[{
            "role": "user",
            "content": [
                content_block,
                {
                    "type": "text",
                    "text": (
                        "Extract the merchant name, total amount, and date from this receipt. "
                        "Return ONLY valid JSON with these fields: "
                        "merchant (string), amount (number, no currency symbol), date (YYYY-MM-DD or empty string). "
                        'Example: {"merchant": "Adobe Inc.", "amount": 54.99, "date": "2025-03-15"}'
                    ),
                },
            ],
        }],
    )
    response = _client.messages.create(**create_kwargs)
    text = response.content[0].text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    data = json.loads(text)
    return {
        "merchant": str(data.get("merchant", "Unknown Merchant")),
        "amount": float(data.get("amount", 0.0)),
        "date": str(data.get("date", "")),
    }


VALID_CATEGORIES = [
    "Equipment", "Software", "Travel", "Meals", "HomeOffice",
    "Phone", "Internet", "Marketing", "Education", "Subscriptions",
    "Vehicle", "Supplies", "Income", "Uncategorized",
]


def categorize_transaction(merchant: str, amount: float, gigs: list[str]) -> dict:
    """Returns {category, confidence_score, type, deductible, needs_review, review_reason, tax_impact, reason}"""
    gig_str = ", ".join(gigs) if gigs else "freelancer"
    prompt = f"""You are a US tax expert helping Texas-based gig workers categorize transactions.
Texas has no state income tax. All tax calculations use federal taxes only.
The combined federal rate is 39.3% (15.3% self-employment tax + 24% federal income tax bracket).

User's gig types: {gig_str}
Merchant: {merchant}
Amount: ${amount}

Follow these rules in order. The first rule that matches wins — do not evaluate further rules after a match.

RULE 1 - TRANSFER: If merchant is a bank transfer, credit card payment, ACH, Zelle, or known bank name, return category Transfer, deductible false, confidence 0.99, needs_review false, review_reason null, tax_impact 0.

RULE 2 - INCOME: If amount is positive and merchant is a known platform (YouTube, Stripe, Patreon, Twitch, Fiverr, Upwork, PayPal), return category Income, deductible false, confidence 0.99, needs_review false, review_reason null. Set tax_impact to amount multiplied by 0.393.

RULE 3 - FORCED REVIEW: The following categories must always have needs_review true regardless of confidence score. Vehicle — mileage input required, set review_reason INCOMPLETE_DATA. Meals — business purpose required, set review_reason AMBIGUOUS_INTENT. Travel — trip purpose required, set review_reason AMBIGUOUS_INTENT. Utilities — business use percentage required, set review_reason INCOMPLETE_DATA. Any transaction where amount exceeds 500.00 — set review_reason LARGE_TRANSACTION. For all forced review items set deductible false and tax_impact to amount multiplied by 0.393 as the ceiling potential savings estimate.

RULE 4 - PROFESSION BOOST: Start with a base confidence score for the merchant category. Then adjust upward based on how well the category fits the user's gig type using these boosts. Content Creator: Software +0.15, Equipment +0.20, Travel +0.10, Meals +0.08, Education +0.10. Podcaster: Software +0.18, Equipment +0.20, Supplies +0.10, Meals +0.08. Streamer: Software +0.20, Equipment +0.20, Supplies +0.12, Travel +0.05. Photographer: Equipment +0.25, Software +0.15, Travel +0.15, Vehicle +0.12. Video Editor: Software +0.25, Equipment +0.18, Education +0.15. Freelance Writer: Software +0.12, Education +0.18, Professional Services +0.10. Rideshare Driver: Vehicle +0.30, Supplies +0.10. Delivery Driver: Vehicle +0.30, Supplies +0.12. Graphic Designer: Software +0.22, Equipment +0.15, Education +0.12. General Freelancer: Software +0.08, Equipment +0.08, Education +0.10. Cap the final confidence score at 0.95 maximum.

RULE 5 - CONFIDENCE THRESHOLD: After applying the profession boost and capping at 0.95, assign the tag as follows. 0.95 — auto-confirm as deductible if not in a forced review category and amount is under 500.00, set needs_review false, deductible true, tax_impact to amount multiplied by 0.393. Between 0.75 and 0.94 — set needs_review true, review_reason AMBIGUOUS_INTENT, deductible false. Below 0.75 — set needs_review true, review_reason LOW_CONFIDENCE, deductible false.

RULE 6 - PERSONAL: If merchant is a grocery store, pharmacy, gym, or personal streaming service, return category Personal, deductible false, needs_review false, confidence 0.92, tax_impact 0.

Return ONLY valid JSON with these exact fields:
- category: one of {VALID_CATEGORIES}
- confidence_score: float between 0.0 and 0.95
- type: "income" or "expense"
- deductible: true or false
- needs_review: true or false
- review_reason: one of "INCOMPLETE_DATA", "AMBIGUOUS_INTENT", "LOW_CONFIDENCE", "LARGE_TRANSACTION", or null
- tax_impact: dollar amount calculated at 39.3% combined federal rate — tax due increase for income, tax saved for confirmed deductions, ceiling potential savings for review items, 0 for personal and transfer
- reason: one short sentence explaining the categorization and its tax impact at the 39.3% combined federal rate

Example for a confirmed deduction:
{{"category": "Software", "confidence_score": 0.95, "type": "expense", "deductible": true, "needs_review": false, "review_reason": null, "tax_impact": 23.57, "reason": "Adobe Creative Cloud is a deductible software subscription for content creators — saves $23.57 at your 39.3% combined federal rate."}}

Example for a needs review item:
{{"category": "Vehicle", "confidence_score": 0.92, "type": "expense", "deductible": false, "needs_review": true, "review_reason": "INCOMPLETE_DATA", "tax_impact": 191.02, "reason": "Shell fuel purchase suggests business driving — confirm your business miles in Optimization to unlock up to $191.02 in tax savings."}}

Example for income:
{{"category": "Income", "confidence_score": 0.99, "type": "income", "deductible": false, "needs_review": false, "review_reason": null, "tax_impact": 1257.60, "reason": "YouTube platform payout — adds $1,257.60 to your estimated federal tax due at your 39.3% combined rate."}}"""

    response = _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.content[0].text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        return {
            "category": "Uncategorized",
            "confidence_score": 0.5,
            "type": "expense",
            "deductible": False,
            "needs_review": True,
            "review_reason": "LOW_CONFIDENCE",
            "tax_impact": 0.0,
            "reason": "Could not categorize automatically — please review.",
        }

    if result.get("category") not in VALID_CATEGORIES:
        result["category"] = "Uncategorized"
    result["confidence_score"] = max(0.0, min(0.95, float(result.get("confidence_score", 0.5))))
    return result


def discover_deductions(transactions: list[dict], gigs: list[str]) -> list[dict]:
    """Returns list of deduction opportunities with review metadata."""
    gig_str = ", ".join(gigs) if gigs else "freelancer"
    tx_summary = "\n".join(
        f"- {t['merchant']}: ${t['amount']} ({t.get('category', 'Uncategorized')})"
        for t in transactions[:50]
    )

    prompt = f"""You are a US tax expert reviewing transactions for a Texas-based gig worker.
Texas has no state income tax. All calculations use federal taxes only.
The combined federal rate is 39.3% (15.3% self-employment tax + 24% federal income tax).
Every potential_savings figure is tax saved in dollars at 39.3%. Never use 24% alone. Never add state tax.

User's gig types: {gig_str}
Transactions:
{tx_summary}

Identify up to 6 specific tax deductions this person is missing or underutilizing. Follow these rules:

RULE 1 - NEEDS REVIEW PRIORITY: Any transaction already flagged needs_review true in the transaction list must appear as a deduction opportunity if its potential savings are significant. These populate the Needs Review queue on the dashboard. Set review_required true and carry the review_reason forward from the transaction.

RULE 2 - INCOMPLETE DATA items: For Vehicle transactions with review_reason INCOMPLETE_DATA, calculate potential_savings as follows. Take total fuel spend, divide by 3.10 (Texas average gas price), multiply by 24 (default MPG), multiply by 0.67 (IRS mileage rate), multiply by 0.393. Set review_required true, review_reason INCOMPLETE_DATA. Detail must explain the user needs to set their business miles in Optimization to confirm this deduction.

RULE 3 - AMBIGUOUS INTENT items: For Travel transactions calculate potential_savings as transaction amount multiplied by 1.0 multiplied by 0.393. For Meals calculate as transaction amount multiplied by 0.50 multiplied by 0.393. Set review_required true, review_reason AMBIGUOUS_INTENT. Detail must explain the user needs to confirm business purpose in Optimization.

RULE 4 - STANDING DEDUCTIONS: Beyond flagged transactions identify deductions the user is likely missing based on their gig type. Include these if not already covered by the transaction list. For Content Creator, Podcaster, Streamer, Video Editor, Photographer, Graphic Designer — Home Office deduction, set potential_savings to 220.00, review_required true, review_reason INCOMPLETE_DATA, status AVAILABLE, detail must explain workspace expenses can be allocated by square footage percentage and the user needs to complete home office setup in Optimization. For all gig types — self-employed health insurance premiums, set potential_savings to 600.00, review_required false, review_reason null, status AVAILABLE. For all gig types — QBI deduction under Section 199A, calculate as estimated net profit multiplied by 0.20 multiplied by 0.393, review_required false, review_reason null, status AVAILABLE.

RULE 5 - ORDERING: Return all items ordered by potential_savings descending.

RULE 6 - STATUS LABELS: Assign status as follows. NEEDS_REVIEW if review_required true and user has not yet opened the Optimization flow for this item. IN_PROGRESS if review_required true and user has started but not confirmed the Optimization flow. AVAILABLE if claimable without further input or if review_required false. CLAIMED if already confirmed and counting toward money saved on the dashboard.

Return ONLY a valid JSON array. Each item must have exactly these fields:
- title: short deduction name
- category: one of {VALID_CATEGORIES}
- potential_savings: estimated annual tax saved as a dollar number at 39.3% combined federal rate
- tax_savings: same value as potential_savings explicitly confirming it is the 39.3% rate calculation
- detail: one sentence explaining the deduction, how it applies to their specific gig type, and what action is needed in Optimization if review_required is true
- review_required: true if this item needs user input in Optimization before the deduction is confirmed, false if it can be claimed directly
- review_reason: one of "INCOMPLETE_DATA", "AMBIGUOUS_INTENT", or null if review_required is false
- status: one of "NEEDS_REVIEW", "IN_PROGRESS", "AVAILABLE", "CLAIMED"

Example for a needs review vehicle item:
[{{"title": "Vehicle Mileage Write-Off", "category": "Vehicle", "potential_savings": 613.97, "tax_savings": 613.97, "detail": "We detected $486.20 in fuel spend suggesting business driving — set your business miles in Optimization to unlock up to $613.97 in federal tax savings at your 39.3% combined rate.", "review_required": true, "review_reason": "INCOMPLETE_DATA", "status": "IN_PROGRESS"}}]

Example for a standing deduction:
[{{"title": "Home Office Deduction", "category": "HomeOffice", "potential_savings": 220.00, "tax_savings": 220.00, "detail": "Workspace expenses can be allocated based on the percentage of your home used exclusively for your content creation business — complete the home office setup in Optimization to confirm this deduction.", "review_required": true, "review_reason": "INCOMPLETE_DATA", "status": "AVAILABLE"}}]

Example for a directly claimable deduction:
[{{"title": "QBI Deduction (Section 199A)", "category": "Uncategorized", "potential_savings": 4084.00, "tax_savings": 4084.00, "detail": "As a self-employed gig worker you may qualify for a 20% deduction on qualified business income under Section 199A — this reduces your taxable income directly with no additional input required.", "review_required": false, "review_reason": null, "status": "AVAILABLE"}}]"""

    response = _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.content[0].text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(text)
