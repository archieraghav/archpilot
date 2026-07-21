import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.insight import Insight
from app.schemas.insight import InsightOut
from app.services.dataset_service import get_dataset, _read_dataframe
from app.services.ai.copilot_graph import run_copilot_analysis

router = APIRouter(prefix="/datasets", tags=["Copilot"])


@router.post("/{dataset_id}/copilot/analyze", response_model=list[InsightOut], status_code=201)
def analyze_dataset(
    dataset_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dataset = get_dataset(db, current_user.id, dataset_id)
    df = _read_dataframe(dataset.file_path, f".{dataset.file_type}")

    findings = run_copilot_analysis(df, dataset.name)

    db.query(Insight).filter(Insight.dataset_id == dataset_id).delete()

    saved = []
    for f in findings:
        insight = Insight(
            dataset_id=dataset_id,
            owner_id=current_user.id,
            category=f["category"],
            severity=f["severity"],
            title=f["title"],
            description=f["description"],
        )
        db.add(insight)
        saved.append(insight)

    db.commit()
    for insight in saved:
        db.refresh(insight)

    return saved


@router.get("/{dataset_id}/copilot/insights", response_model=list[InsightOut])
def get_insights(
    dataset_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Insight)
        .filter(Insight.dataset_id == dataset_id, Insight.owner_id == current_user.id)
        .order_by(Insight.created_at.desc())
        .all()
    )