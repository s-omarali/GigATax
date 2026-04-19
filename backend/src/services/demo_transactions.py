from __future__ import annotations

import uuid
from datetime import date, timedelta
from typing import Any


def _build_tx(tx_id: str, days_ago: int, merchant: str, amount: float, tx_type: str, category: str, note: str = "") -> dict[str, Any]:
    tx_date = (date.today() - timedelta(days=days_ago)).isoformat()
    return {
        "id": tx_id,
        "date": tx_date,
        "merchant": merchant,
        "amount": round(amount, 2),
        "type": tx_type,
        "category": category,
        "confidenceScore": 0.94 if category != "Uncategorized" else 0.7,
        "source": "bank",
        "notes": f"DEMO: {note}" if note else "DEMO: seeded transaction",
    }


def _content_creator_transactions() -> list[dict[str, Any]]:
    return [
        _build_tx("demo-cc-1", 2, "YouTube", 2650, "income", "Income", "Ad revenue payout"),
        _build_tx("demo-cc-2", 8, "Patreon", 740, "income", "Income", "Membership income"),
        _build_tx("demo-cc-3", 11, "Adobe", 59.99, "expense", "Software", "Creative Cloud"),
        _build_tx("demo-cc-4", 17, "Shell", 142.38, "expense", "Vehicle", "Business commute and filming"),
        _build_tx("demo-cc-5", 21, "Best Buy", 229.00, "expense", "Supplies", "Content equipment"),
    ]


def _video_editor_transactions() -> list[dict[str, Any]]:
    return [
        _build_tx("demo-ve-1", 3, "Upwork", 1800, "income", "Income", "Editing contract"),
        _build_tx("demo-ve-2", 9, "Stripe", 940, "income", "Income", "Direct client invoice"),
        _build_tx("demo-ve-3", 10, "Frame.io", 15.0, "expense", "Software", "Review and collaboration"),
        _build_tx("demo-ve-4", 15, "DaVinci Resolve Studio", 29.0, "expense", "Software", "Editor tooling"),
        _build_tx("demo-ve-5", 26, "Delta", 380.0, "expense", "Travel", "On-site client project"),
    ]


def _streamer_transactions() -> list[dict[str, Any]]:
    return [
        _build_tx("demo-st-1", 1, "Twitch", 1250, "income", "Income", "Subscriber payout"),
        _build_tx("demo-st-2", 7, "PayPal", 420, "income", "Income", "Tips and donations"),
        _build_tx("demo-st-3", 14, "Elgato", 149.0, "expense", "Supplies", "Capture card"),
        _build_tx("demo-st-4", 18, "Canva", 15.0, "expense", "Software", "Thumbnails and assets"),
        _build_tx("demo-st-5", 23, "DoorDash", 48.5, "expense", "Meals", "Stream production meal"),
    ]


def _photographer_transactions() -> list[dict[str, Any]]:
    return [
        _build_tx("demo-ph-1", 4, "HoneyBook", 2100, "income", "Income", "Wedding shoot"),
        _build_tx("demo-ph-2", 13, "Pixieset", 680, "income", "Income", "Gallery sales"),
        _build_tx("demo-ph-3", 12, "LensRentals", 175, "expense", "Supplies", "Lens rental"),
        _build_tx("demo-ph-4", 16, "Chevron", 118.7, "expense", "Vehicle", "Travel to session locations"),
        _build_tx("demo-ph-5", 24, "Hilton", 264, "expense", "Travel", "Overnight client project"),
    ]


def _podcaster_transactions() -> list[dict[str, Any]]:
    return [
        _build_tx("demo-po-1", 5, "Spotify", 930, "income", "Income", "Podcast partner payout"),
        _build_tx("demo-po-2", 6, "Patreon", 310, "income", "Income", "Listener memberships"),
        _build_tx("demo-po-3", 12, "Riverside", 24.0, "expense", "Software", "Remote recording"),
        _build_tx("demo-po-4", 19, "Shure", 199.0, "expense", "Supplies", "Microphone gear"),
        _build_tx("demo-po-5", 28, "Uber", 32.4, "expense", "Travel", "Guest interview travel"),
    ]


def _freelance_writer_transactions() -> list[dict[str, Any]]:
    return [
        _build_tx("demo-fw-1", 2, "Substack", 880, "income", "Income", "Paid subscriber payout"),
        _build_tx("demo-fw-2", 9, "Wise", 1240, "income", "Income", "Client editorial retainer"),
        _build_tx("demo-fw-3", 11, "Grammarly", 12.0, "expense", "Software", "Writing assistant"),
        _build_tx("demo-fw-4", 20, "Amazon", 54.2, "expense", "Supplies", "Reference materials"),
        _build_tx("demo-fw-5", 27, "Blue Bottle", 23.6, "expense", "Meals", "Interview meeting coffee"),
    ]


GIG_TX_BUILDERS = {
    "content creator": _content_creator_transactions,
    "video editor": _video_editor_transactions,
    "streamer": _streamer_transactions,
    "photographer": _photographer_transactions,
    "podcaster": _podcaster_transactions,
    "freelance writer": _freelance_writer_transactions,
}


def build_demo_transactions_for_gigs(gigs: list[str]) -> list[dict[str, Any]]:
    if not gigs:
        gigs = ["Content Creator"]

    transactions: list[dict[str, Any]] = []
    seen_ids: set[str] = set()

    for gig in gigs:
        builder = GIG_TX_BUILDERS.get(gig.lower())
        if not builder:
            continue
        for tx in builder():
            if tx["id"] in seen_ids:
                continue
            seen_ids.add(tx["id"])
            transactions.append(tx)

    return sorted(transactions, key=lambda tx: tx["date"], reverse=True)


def build_deductions_and_signal(transactions: list[dict[str, Any]], tax_rate: float) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    deductible_categories = {"Software", "Travel", "Meals", "Vehicle", "Home Office", "Supplies"}
    category_totals: dict[str, float] = {}

    for tx in transactions:
        if tx["type"] != "expense":
            continue
        category = tx["category"]
        if category not in deductible_categories:
            continue
        category_totals[category] = category_totals.get(category, 0.0) + float(tx["amount"])

    deductions: list[dict[str, Any]] = []
    for idx, (category, total) in enumerate(sorted(category_totals.items(), key=lambda item: item[1], reverse=True)):
        status = "claimed" if idx == 0 else "in_progress" if idx == 1 else "available"
        potential_savings = round(total * tax_rate, 2)
        deductions.append(
            {
                "id": f"demo-{category.lower().replace(' ', '-')}",
                "title": f"{category} Expenses",
                "category": category,
                "status": status,
                "potentialSavings": potential_savings,
                "detail": f"Detected ${total:,.2f} in {category.lower()} spending.",
            }
        )

    gas_spend = round(sum(float(tx["amount"]) for tx in transactions if tx["type"] == "expense" and tx["category"] == "Vehicle"), 2)
    signals = [
        {
            "id": "demo-vehicle-signal",
            "type": "vehicle_mileage",
            "gasSpend": gas_spend,
            "detectedPeriodLabel": "Last 90 days",
        }
    ]

    return deductions, signals


def seed_demo_rows_for_user(user_id: str, gigs: list[str], tax_rate: float) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    transactions = build_demo_transactions_for_gigs(gigs)
    deductions, signals = build_deductions_and_signal(transactions, tax_rate)

    tx_rows = [
        {
            "id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"{user_id}:{tx['id']}")),
            "user_id": user_id,
            "date": tx["date"],
            "merchant": tx["merchant"],
            "amount": tx["amount"],
            "type": tx["type"],
            "category": tx["category"],
            "confidence_score": tx["confidenceScore"],
            "source": tx["source"],
            "notes": tx.get("notes", "DEMO: seeded transaction"),
        }
        for tx in transactions
    ]

    deduction_rows = [
        {
            "id": f"{user_id}:{deduction['id']}",
            "user_id": user_id,
            "title": deduction["title"],
            "category": deduction["category"],
            "status": deduction["status"],
            "potential_savings": deduction["potentialSavings"],
            "detail": f"DEMO: {deduction['detail']}",
        }
        for deduction in deductions
    ]

    signal_rows = [
        {
            "id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"{user_id}:{signal['id']}")),
            "user_id": user_id,
            "type": signal["type"],
            "gas_spend": signal["gasSpend"],
            "detected_period_label": signal["detectedPeriodLabel"],
        }
        for signal in signals
    ]

    return tx_rows, deduction_rows, signal_rows
