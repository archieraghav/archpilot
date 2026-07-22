import uuid
from datetime import datetime, timezone
from io import BytesIO

import pandas as pd
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem

from app.models.insight import Insight
from app.services.dataset_service import get_dataset, _read_dataframe
from app.services.ai.llm_provider import generate_response


def _compute_kpis(df: pd.DataFrame) -> list[dict]:
    kpis = []
    numeric_cols = df.select_dtypes(include="number").columns
    for col in numeric_cols[:4]:
        kpis.append({
            "label": col,
            "total": round(float(df[col].sum()), 2),
            "average": round(float(df[col].mean()), 2),
        })
    return kpis


def _generate_summary(dataset_name: str, kpis: list[dict], insights: list[dict]) -> str:
    kpi_text = "\n".join(f"- {k['label']}: total {k['total']}, average {k['average']}" for k in kpis)
    insight_text = "\n".join(f"- [{i['category']}/{i['severity']}] {i['title']}: {i['description']}" for i in insights)

    system_prompt = """You are ArchPilot, writing a concise executive summary for a
board-level business report. Given KPIs and AI-generated insights, write 3-4
sentences summarizing overall business health, the most important finding,
and one clear recommendation. Be direct and specific, no filler."""

    user_prompt = f"Dataset: {dataset_name}\n\nKPIs:\n{kpi_text}\n\nInsights:\n{insight_text}"
    return generate_response(system_prompt, user_prompt)


def build_report(db: Session, owner_id: uuid.UUID, dataset_id: uuid.UUID, forecast_column: str | None) -> dict:
    dataset = get_dataset(db, owner_id, dataset_id)
    df = _read_dataframe(dataset.file_path, f".{dataset.file_type}")

    kpis = _compute_kpis(df)

    insights = (
        db.query(Insight)
        .filter(Insight.dataset_id == dataset_id, Insight.owner_id == owner_id)
        .order_by(Insight.created_at.desc())
        .all()
    )
    insights_data = [
        {"category": i.category, "severity": i.severity, "title": i.title, "description": i.description}
        for i in insights
    ]

    risks = [i["description"] for i in insights_data if i["category"] in ("risk", "anomaly")]
    recommendations = [i["description"] for i in insights_data if i["category"] == "opportunity"]

    forecast_summary = None
    if forecast_column and forecast_column in df.columns:
        from app.services.analytics.forecasting_service import forecast_column as run_forecast
        try:
            forecast_result = run_forecast(df, forecast_column, periods=3)
            forecast_summary = forecast_result["explanation"]
        except Exception:
            forecast_summary = None

    executive_summary = _generate_summary(dataset.name, kpis, insights_data)

    return {
        "dataset_id": dataset_id,
        "dataset_name": dataset.name,
        "executive_summary": executive_summary,
        "kpis": kpis,
        "insights": insights_data,
        "forecast_summary": forecast_summary,
        "risks": risks,
        "recommendations": recommendations,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def render_report_markdown(report: dict) -> str:
    lines = [
        f"# Executive Report: {report['dataset_name']}",
        f"*Generated {report['generated_at']}*",
        "",
        "## Executive Summary",
        report["executive_summary"],
        "",
        "## Key KPIs",
    ]
    for kpi in report["kpis"]:
        lines.append(f"- **{kpi['label']}**: total {kpi['total']}, average {kpi['average']}")

    lines.append("")
    lines.append("## Business Insights")
    for insight in report["insights"]:
        lines.append(f"- **[{insight['severity'].upper()}] {insight['title']}** — {insight['description']}")

    if report["forecast_summary"]:
        lines.append("")
        lines.append("## Forecast")
        lines.append(report["forecast_summary"])

    lines.append("")
    lines.append("## Risks")
    for risk in report["risks"]:
        lines.append(f"- {risk}")
    if not report["risks"]:
        lines.append("- No significant risks identified.")

    lines.append("")
    lines.append("## Recommendations")
    for rec in report["recommendations"]:
        lines.append(f"- {rec}")
    if not report["recommendations"]:
        lines.append("- No specific recommendations at this time.")

    lines.append("")
    lines.append("## Conclusion")
    lines.append("This report was generated automatically by ArchPilot based on the uploaded dataset.")

    return "\n".join(lines)


def render_report_pdf(report: dict) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.75 * inch, bottomMargin=0.75 * inch)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle("TitleStyle", parent=styles["Heading1"], fontSize=20, spaceAfter=6)
    meta_style = ParagraphStyle("MetaStyle", parent=styles["Normal"], textColor="#64748B", spaceAfter=16)
    heading_style = ParagraphStyle("SectionHeading", parent=styles["Heading2"], fontSize=13, spaceBefore=16, spaceAfter=8)
    body_style = styles["Normal"]

    elements = [
        Paragraph(f"Executive Report: {report['dataset_name']}", title_style),
        Paragraph(f"Generated {report['generated_at']}", meta_style),
        Paragraph("Executive Summary", heading_style),
        Paragraph(report["executive_summary"], body_style),
        Paragraph("Key KPIs", heading_style),
    ]

    kpi_items = [
        ListItem(Paragraph(f"<b>{k['label']}</b>: total {k['total']}, average {k['average']}", body_style))
        for k in report["kpis"]
    ]
    elements.append(ListFlowable(kpi_items, bulletType="bullet"))

    elements.append(Paragraph("Business Insights", heading_style))
    insight_items = [
        ListItem(Paragraph(f"<b>[{i['severity'].upper()}] {i['title']}</b> — {i['description']}", body_style))
        for i in report["insights"]
    ]
    elements.append(ListFlowable(insight_items, bulletType="bullet") if insight_items else Paragraph("No insights available.", body_style))

    if report["forecast_summary"]:
        elements.append(Paragraph("Forecast", heading_style))
        elements.append(Paragraph(report["forecast_summary"], body_style))

    elements.append(Paragraph("Risks", heading_style))
    if report["risks"]:
        risk_items = [ListItem(Paragraph(r, body_style)) for r in report["risks"]]
        elements.append(ListFlowable(risk_items, bulletType="bullet"))
    else:
        elements.append(Paragraph("No significant risks identified.", body_style))

    elements.append(Paragraph("Recommendations", heading_style))
    if report["recommendations"]:
        rec_items = [ListItem(Paragraph(r, body_style)) for r in report["recommendations"]]
        elements.append(ListFlowable(rec_items, bulletType="bullet"))
    else:
        elements.append(Paragraph("No specific recommendations at this time.", body_style))

    elements.append(Paragraph("Conclusion", heading_style))
    elements.append(Paragraph("This report was generated automatically by ArchPilot based on the uploaded dataset.", body_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()