import uuid

from pydantic import BaseModel


class ReportGenerateRequest(BaseModel):
    forecast_column: str | None = None


class ReportOut(BaseModel):
    dataset_id: uuid.UUID
    dataset_name: str
    executive_summary: str
    kpis: list[dict]
    insights: list[dict]
    forecast_summary: str | None
    risks: list[str]
    recommendations: list[str]
    generated_at: str