import uuid

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.report import ReportGenerateRequest, ReportOut
from app.services import report_service

router = APIRouter(prefix="/datasets", tags=["Reports"])


@router.post("/{dataset_id}/report", response_model=ReportOut)
def generate_report(
    dataset_id: uuid.UUID,
    payload: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return report_service.build_report(db, current_user.id, dataset_id, payload.forecast_column)


@router.post("/{dataset_id}/report/markdown")
def download_report_markdown(
    dataset_id: uuid.UUID,
    payload: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = report_service.build_report(db, current_user.id, dataset_id, payload.forecast_column)
    markdown_content = report_service.render_report_markdown(report)
    return Response(
        content=markdown_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename=report-{dataset_id}.md"},
    )


@router.post("/{dataset_id}/report/pdf")
def download_report_pdf(
    dataset_id: uuid.UUID,
    payload: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = report_service.build_report(db, current_user.id, dataset_id, payload.forecast_column)
    pdf_bytes = report_service.render_report_pdf(report)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report-{dataset_id}.pdf"},
    )