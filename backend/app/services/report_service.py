from supabase import Client
from datetime import datetime
import io
import csv

from app.models.report import (
    MonthlyReport,
    MonthlyReportItem,
    CategoryReport,
    CategoryBreakdown,
)


class ReportService:
    def __init__(self, db: Client):
        self.db = db

    async def get_monthly_report(
        self, user_id: str, start_date: str, end_date: str
    ) -> MonthlyReport:
        """Get monthly spending report."""
        expenses = (
            self.db.table("expenses")
            .select("*")
            .eq("user_id", user_id)
            .gte("date", start_date)
            .lte("date", end_date)
            .order("date")
            .execute()
        ).data

        # Group by month
        monthly_data = {}
        for expense in expenses:
            month = expense["date"][:7]  # YYYY-MM
            if month not in monthly_data:
                monthly_data[month] = {
                    "month": month,
                    "total_spent": 0,
                    "total_income": 0,
                    "transaction_count": 0,
                }
            monthly_data[month]["total_spent"] += expense["amount"]
            monthly_data[month]["transaction_count"] += 1

        items = []
        for month_data in sorted(monthly_data.values(), key=lambda x: x["month"]):
            month_data["net_balance"] = month_data["total_income"] - month_data["total_spent"]
            items.append(MonthlyReportItem(**month_data))

        total_spent = sum(item.total_spent for item in items)
        total_income = sum(item.total_income for item in items)
        avg_monthly = total_spent / len(items) if items else 0

        return MonthlyReport(
            period=f"{start_date} to {end_date}",
            data=items,
            total_spent=total_spent,
            total_income=total_income,
            average_monthly_spending=round(avg_monthly, 2),
        )

    async def get_category_report(
        self, user_id: str, start_date: str, end_date: str
    ) -> CategoryReport:
        """Get category breakdown report."""
        expenses = (
            self.db.table("expenses")
            .select("*, category:categories(id, name, icon, color)")
            .eq("user_id", user_id)
            .gte("date", start_date)
            .lte("date", end_date)
            .execute()
        ).data

        # Group by category
        category_data = {}
        total_spent = 0

        for expense in expenses:
            cat_id = expense["category_id"]
            if cat_id not in category_data:
                category_data[cat_id] = {
                    "category_id": cat_id,
                    "category_name": expense["category"]["name"] if expense["category"] else "Unknown",
                    "category_color": expense["category"]["color"] if expense["category"] else "#6b7280",
                    "category_icon": expense["category"]["icon"] if expense["category"] else "📦",
                    "total_amount": 0,
                    "transaction_count": 0,
                }
            category_data[cat_id]["total_amount"] += expense["amount"]
            category_data[cat_id]["transaction_count"] += 1
            total_spent += expense["amount"]

        breakdown = []
        for cat in category_data.values():
            cat["percentage"] = round((cat["total_amount"] / total_spent) * 100, 2) if total_spent > 0 else 0
            cat["average_per_transaction"] = round(
                cat["total_amount"] / cat["transaction_count"], 2
            ) if cat["transaction_count"] > 0 else 0
            breakdown.append(CategoryBreakdown(**cat))

        breakdown.sort(key=lambda x: x.total_amount, reverse=True)

        return CategoryReport(
            period=f"{start_date} to {end_date}",
            breakdown=breakdown,
            total_spent=total_spent,
        )

    async def export_csv(
        self, user_id: str, start_date: str, end_date: str
    ) -> tuple[bytes, str]:
        """Export expenses as CSV."""
        expenses = (
            self.db.table("expenses")
            .select("*, category:categories(name)")
            .eq("user_id", user_id)
            .gte("date", start_date)
            .lte("date", end_date)
            .order("date", desc=True)
            .execute()
        ).data

        output = io.StringIO()
        writer = csv.writer(output)

        # Header
        writer.writerow(["Date", "Category", "Description", "Amount", "Payment Method"])

        # Data
        for expense in expenses:
            writer.writerow([
                expense["date"],
                expense["category"]["name"] if expense["category"] else "Unknown",
                expense["description"],
                expense["amount"],
                expense["payment_method"],
            ])

        content = output.getvalue().encode("utf-8")
        filename = f"expenses_{start_date}_to_{end_date}.csv"

        return content, filename

    async def export_pdf(
        self, user_id: str, start_date: str, end_date: str
    ) -> tuple[bytes, str]:
        """Export expenses as PDF."""
        try:
            from reportlab.lib import colors
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet
        except ImportError:
            raise ImportError(
                "PDF export requires reportlab. Install it with: pip install reportlab"
            )

        expenses = (
            self.db.table("expenses")
            .select("*, category:categories(name)")
            .eq("user_id", user_id)
            .gte("date", start_date)
            .lte("date", end_date)
            .order("date", desc=True)
            .execute()
        ).data

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Title
        title = Paragraph(f"Expense Report: {start_date} to {end_date}", styles["Heading1"])
        elements.append(title)
        elements.append(Spacer(1, 20))

        # Summary
        total = sum(e["amount"] for e in expenses)
        summary = Paragraph(f"Total Expenses: ${total:.2f}", styles["Normal"])
        elements.append(summary)
        elements.append(Spacer(1, 20))

        # Table
        data = [["Date", "Category", "Description", "Amount"]]
        for expense in expenses:
            data.append([
                expense["date"],
                expense["category"]["name"] if expense["category"] else "Unknown",
                expense["description"][:30] + "..." if len(expense["description"]) > 30 else expense["description"],
                f"${expense['amount']:.2f}",
            ])

        table = Table(data)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 12),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
            ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements.append(table)

        doc.build(elements)
        content = buffer.getvalue()
        filename = f"expenses_{start_date}_to_{end_date}.pdf"

        return content, filename
