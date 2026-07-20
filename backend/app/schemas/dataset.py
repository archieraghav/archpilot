import uuid
from datetime import datetime

from pydantic import BaseModel


class DatasetOut(BaseModel):
    id: uuid.UUID
    name: str
    original_filename: str
    file_type: str
    row_count: int
    column_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DatasetRename(BaseModel):
    name: str


class DatasetPreview(BaseModel):
    columns: list[str]
    rows: list[dict]
    total_rows: int