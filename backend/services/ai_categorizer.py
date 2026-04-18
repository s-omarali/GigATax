import os
import json
import anthropic
from models.expense import CATEGORIES

_client: anthropic.Anthropic | None = None

SYSTEM_PROMPT = f"""You are an expense categorizer for small business owners.
Given a merchant name and transaction amount, return the single best matching category.

Available categories:
{chr(10).join(f"- {c}" for c in CATEGORIES)}

Special notes:
- "Sadaqah" = voluntary Islamic charity (e.g. donations to mosques, GoFundMe, charity orgs)
- "Zakat" = obligatory Islamic giving (user will typically label these explicitly)
- "Business Expense" = general overhead, supplies, professional services

Respond ONLY with valid JSON in this exact format:
{{"category": "<category name>", "confidence": <0.0-1.0>}}"""


def get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _client


def categorize(merchant: str, amount: float) -> tuple[str, float]:
    client = get_client()
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=64,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[
            {
                "role": "user",
                "content": f"Merchant: {merchant}\nAmount: ${amount:.2f}",
            }
        ],
    )
    raw = response.content[0].text.strip()
    result = json.loads(raw)
    return result["category"], float(result["confidence"])


async def categorize_batch(expenses: list[dict]) -> list[dict]:
    """Categorize a list of expense dicts in-place, returns updated list."""
    import asyncio

    async def _categorize_one(expense: dict) -> dict:
        loop = asyncio.get_event_loop()
        category, confidence = await loop.run_in_executor(
            None, categorize, expense["merchant"], expense["amount"]
        )
        expense["category"] = category
        expense["confidence"] = confidence
        return expense

    tasks = [_categorize_one(e) for e in expenses if e.get("category") in (None, "Other", "")]
    return await asyncio.gather(*tasks)
