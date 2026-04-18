from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import date
from uuid import UUID

Source = Literal["plaid", "email", "venmo", "zelle", "manual"]

CATEGORIES = [
    "Business Expense",
    "Software / SaaS",
    "Marketing",
    "Travel",
    "Food & Dining",
    "Sadaqah",
    "Zakat",
    "Other",
]


class Expense(BaseModel):
    id: Optional[UUID] = None
    user_id: str
    source: Source
    merchant: str
    amount: float
    date: date
    category: str = "Other"
    raw_text: Optional[str] = None
    confidence: Optional[float] = None


class ExpenseCreate(BaseModel):
    source: Source
    merchant: str
    amount: float
    date: date
    category: str = "Other"
    raw_text: Optional[str] = None


class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    merchant: Optional[str] = None


class CategoryRule(BaseModel):
    id: Optional[UUID] = None
    user_id: str
    pattern: str
    category: str


class CategoryRuleCreate(BaseModel):
    pattern: str
    category: str
