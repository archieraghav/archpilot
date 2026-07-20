import uuid

from fastapi import APIRouter, Depends, File, UploadFile, Form
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.dataset import DatasetOut, DatasetRename, DatasetPreview
from app.services import dataset_service

router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.post("/upload", response_model=DatasetOut, status_code=201)
def upload_dataset(
    file: UploadFile = File(...),
    name: str | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return dataset_service.create_dataset(db, current_user.id, file, name)


@router.get("", response_model=list[DatasetOut])
def get_datasets(
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return dataset_service.list_datasets(db, current_user.id, search)


@router.get("/{dataset_id}", response_model=DatasetOut)
def get_dataset(
    dataset_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return dataset_service.get_dataset(db, current_user.id, dataset_id)


@router.get("/{dataset_id}/preview", response_model=DatasetPreview)
def get_dataset_preview(
    dataset_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return dataset_service.preview_dataset(db, current_user.id, dataset_id)


@router.patch("/{dataset_id}", response_model=DatasetOut)
def rename_dataset(
    dataset_id: uuid.UUID,
    payload: DatasetRename,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return dataset_service.rename_dataset(db, current_user.id, dataset_id, payload.name)


@router.delete("/{dataset_id}", status_code=204)
def delete_dataset(
    dataset_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dataset_service.delete_dataset(db, current_user.id, dataset_id)