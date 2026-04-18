import io
from datetime import date
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from db import get_client

router = APIRouter()
DEMO_USER_ID = "demo-user"


def _get_expenses(user_id: str, start: str | None, end: str | None) -> list[dict]:
    db = get_client()
    query = db.table("expenses").select("*").eq("user_id", user_id).order("date", desc=True)
    if start:
        query = query.gte("date", start)
    if end:
        query = query.lte("date", end)
    return query.execute().data or []


@router.get("/csv")
def export_csv(
    user_id: str = DEMO_USER_ID,
    start: str | None = None,
    end: str | None = None,
):
    expenses = _get_expenses(user_id, start, end)
    df = pd.DataFrame(expenses, columns=["date", "merchant", "amount", "category", "source", "confidence"])
    df = df.rename(columns={"source": "Source", "merchant": "Merchant", "amount": "Amount",
                             "date": "Date", "category": "Category", "confidence": "Confidence"})
    df["Amount"] = df["Amount"].apply(lambda x: f"${x:.2f}")

    buf = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)

    filename = f"expenses_{date.today().isoformat()}.csv"
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/pdf")
def export_pdf(
    user_id: str = DEMO_USER_ID,
    start: str | None = None,
    end: str | None = None,
):
    expenses = _get_expenses(user_id, start, end)
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Expense Report", styles["Title"]))
    elements.append(Spacer(1, 12))

    # Summary by category
    if expenses:
        df = pd.DataFrame(expenses)
        summary = df.groupby("category")["amount"].sum().reset_index()
        summary_data = [["Category", "Total"]] + [
            [row["category"], f"${row['amount']:.2f}"] for _, row in summary.iterrows()
        ]
        summary_data.append(["TOTAL", f"${df['amount'].sum():.2f}"])
        summary_table = Table(summary_data, colWidths=[300, 100])
        summary_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a1a2e")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, colors.HexColor("#f5f5f5")]),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("PADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(Paragraph("Summary by Category", styles["Heading2"]))
        elements.append(summary_table)
        elements.append(Spacer(1, 24))

        # Full transaction table
        tx_data = [["Date", "Merchant", "Amount", "Category", "Source"]] + [
            [e["date"], e["merchant"], f"${e['amount']:.2f}", e["category"], e["source"]]
            for e in expenses
        ]
        tx_table = Table(tx_data, colWidths=[80, 160, 70, 110, 70])
        tx_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a1a2e")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("PADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(Paragraph("All Transactions", styles["Heading2"]))
        elements.append(tx_table)

    doc.build(elements)
    buf.seek(0)

    filename = f"expenses_{date.today().isoformat()}.pdf"
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
