import os
import uuid

import pandas as pd
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models.dataset import Dataset

STORAGE_DIR = os.path.join(os.getcwd(), "storage", "datasets")
ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}


def _ensure_storage_dir() -> None:
    os.makedirs(STORAGE_DIR, exist_ok=True)


def _read_dataframe(path: str, file_type: str) -> pd.DataFrame:
    if file_type == ".csv":
        return pd.read_csv(path)
    return pd.read_excel(path)


def save_uploaded_file(file: UploadFile, owner_id: uuid.UUID) -> tuple[str, str]:
    _ensure_storage_dir()

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV and Excel files are supported",
        )

    stored_filename = f"{owner_id}_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(STORAGE_DIR, stored_filename)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    return file_path, ext


def create_dataset(db: Session, owner_id: uuid.UUID, file: UploadFile, dataset_name: str | None) -> Dataset:
    file_path, ext = save_uploaded_file(file, owner_id)

    try:
        df = _read_dataframe(file_path, ext)
    except Exception:
        os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not parse file — check that it is a valid CSV/Excel file",
        )

    dataset = Dataset(
        owner_id=owner_id,
        name=dataset_name or (file.filename or "Untitled dataset"),
        original_filename=file.filename or "unknown",
        file_path=file_path,
        file_type=ext.lstrip("."),
        row_count=len(df),
        column_count=len(df.columns),
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    return dataset


def list_datasets(db: Session, owner_id: uuid.UUID, search: str | None = None) -> list[Dataset]:
    query = db.query(Dataset).filter(Dataset.owner_id == owner_id)
    if search:
        query = query.filter(Dataset.name.ilike(f"%{search}%"))
    return query.order_by(Dataset.created_at.desc()).all()


def get_dataset(db: Session, owner_id: uuid.UUID, dataset_id: uuid.UUID) -> Dataset:
    dataset = (
        db.query(Dataset)
        .filter(Dataset.id == dataset_id, Dataset.owner_id == owner_id)
        .first()
    )
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
    return dataset


def rename_dataset(db: Session, owner_id: uuid.UUID, dataset_id: uuid.UUID, new_name: str) -> Dataset:
    dataset = get_dataset(db, owner_id, dataset_id)
    dataset.name = new_name
    db.commit()
    db.refresh(dataset)
    return dataset


def delete_dataset(db: Session, owner_id: uuid.UUID, dataset_id: uuid.UUID) -> None:
    dataset = get_dataset(db, owner_id, dataset_id)
    if os.path.exists(dataset.file_path):
        os.remove(dataset.file_path)
    db.delete(dataset)
    db.commit()


def preview_dataset(db: Session, owner_id: uuid.UUID, dataset_id: uuid.UUID, limit: int = 50) -> dict:
    dataset = get_dataset(db, owner_id, dataset_id)
    df = _read_dataframe(dataset.file_path, f".{dataset.file_type}")
    preview_df = df.head(limit).fillna("")
    return {
        "columns": list(df.columns.astype(str)),
        "rows": preview_df.to_dict(orient="records"),
        "total_rows": len(df),
    }