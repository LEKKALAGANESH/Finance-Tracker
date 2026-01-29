from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse

from app.api.deps import get_current_user_id, get_db_client
from app.models.report import MonthlyReport, CategoryReport, ExportRequest
from app.models.common import DataResponse
from app.services.report_service import ReportService

router = APIRouter()


@router.get("/monthly", response_model=DataResponse[MonthlyReport])
async def get_monthly_report(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Get monthly spending report."""
    service = ReportService(db)
    result = await service.get_monthly_report(user_id, start_date, end_date)
    return DataResponse(data=result)


@router.get("/category", response_model=DataResponse[CategoryReport])
async def get_category_report(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Get category breakdown report."""
    service = ReportService(db)
    result = await service.get_category_report(user_id, start_date, end_date)
    return DataResponse(data=result)


@router.get("/export")
async def export_data(
    format: str = Query("csv", description="Export format (csv or pdf)"),
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db_client),
):
    """Export financial data as CSV or PDF."""
    service = ReportService(db)

    if format == "csv":
        content, filename = await service.export_csv(user_id, start_date, end_date)
        return StreamingResponse(
            iter([content]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    elif format == "pdf":
        content, filename = await service.export_pdf(user_id, start_date, end_date)
        return StreamingResponse(
            iter([content]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    else:
        return DataResponse(data=None, message="Invalid format. Use 'csv' or 'pdf'")
