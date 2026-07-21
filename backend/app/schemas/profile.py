from pydantic import BaseModel


class ColumnProfile(BaseModel):
    name: str
    inferred_type: str
    missing_count: int
    missing_percent: float
    unique_count: int
    outlier_count: int | None = None
    min_value: float | str | None = None
    max_value: float | str | None = None
    mean_value: float | None = None


class DatasetProfile(BaseModel):
    row_count: int
    column_count: int
    duplicate_row_count: int
    quality_score: float
    columns: list[ColumnProfile]