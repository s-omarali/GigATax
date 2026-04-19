from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.src.routers import dashboard, filing, onboarding, optimization, plaid, receipts, users

app = FastAPI(title="GigATax API", version="0.1.0")

default_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://hackmsa-2026-tawny.vercel.app",
]

env_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOW_ORIGINS", "").split(",")
    if origin.strip()
]

allow_origins = list(dict.fromkeys([*default_origins, *env_origins]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(dashboard.router)
app.include_router(onboarding.router)
app.include_router(plaid.router)
app.include_router(receipts.router)
app.include_router(optimization.router)
app.include_router(filing.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
