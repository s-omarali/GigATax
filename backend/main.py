from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.src.routers import dashboard, filing, onboarding, optimization, receipts, users

app = FastAPI(title="GigATax API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(dashboard.router)
app.include_router(onboarding.router)
app.include_router(receipts.router)
app.include_router(optimization.router)
app.include_router(filing.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
