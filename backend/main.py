from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import plaid, email, expenses, export

app = FastAPI(title="HackMSA Expense Tracker", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(plaid.router, prefix="/api/plaid", tags=["plaid"])
app.include_router(email.router, prefix="/api/email", tags=["email"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["expenses"])
app.include_router(export.router, prefix="/api/export", tags=["export"])


@app.get("/health")
def health():
    return {"status": "ok"}
