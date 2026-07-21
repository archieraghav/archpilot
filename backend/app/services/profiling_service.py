import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from app.services.dataset_service import get_dataset, _read_dataframe


def _infer_type(series: pd.Series) -> str:
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"
    if pd.api.types.is_bool_dtype(series):
        return "boolean"
    if pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"

    non_null = series.dropna()
    if len(non_null) > 0:
        parsed = pd.to_datetime(non_null, errors="coerce", format="mixed")
        if parsed.notna().mean() > 0.9:
            return "datetime"

    return "categorical"


def _detect_outliers(series: pd.Series) -> int:
    numeric = pd.to_numeric(series, errors="coerce").dropna()
    if len(numeric) < 4:
        return 0
    q1, q3 = np.percentile(numeric, [25, 75])
    iqr = q3 - q1
    if iqr == 0:
        return 0
    lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    return int(((numeric < lower) | (numeric > upper)).sum())


def profile_dataset(db: Session, owner_id, dataset_id) -> dict:
    dataset = get_dataset(db, owner_id, dataset_id)
    df = _read_dataframe(dataset.file_path, f".{dataset.file_type}")

    total_rows = len(df)
    duplicate_count = int(df.duplicated().sum())

    columns = []
    total_missing = 0
    total_cells = total_rows * len(df.columns) if total_rows else 1

    for col in df.columns:
        series = df[col]
        missing = int(series.isna().sum())
        total_missing += missing
        inferred = _infer_type(series)

        col_profile = {
            "name": str(col),
            "inferred_type": inferred,
            "missing_count": missing,
            "missing_percent": round((missing / total_rows) * 100, 2) if total_rows else 0.0,
            "unique_count": int(series.nunique(dropna=True)),
            "outlier_count": None,
            "min_value": None,
            "max_value": None,
            "mean_value": None,
        }

        if inferred == "numeric":
            numeric = pd.to_numeric(series, errors="coerce")
            col_profile["outlier_count"] = _detect_outliers(series)
            col_profile["min_value"] = float(numeric.min()) if not numeric.empty else None
            col_profile["max_value"] = float(numeric.max()) if not numeric.empty else None
            col_profile["mean_value"] = round(float(numeric.mean()), 2) if not numeric.empty else None
        elif inferred == "categorical":
            non_null = series.dropna().astype(str)
            col_profile["min_value"] = non_null.min() if not non_null.empty else None
            col_profile["max_value"] = non_null.max() if not non_null.empty else None

        columns.append(col_profile)

    completeness = 1 - (total_missing / total_cells) if total_cells else 1
    duplicate_penalty = (duplicate_count / total_rows) if total_rows else 0
    outlier_counts = [c["outlier_count"] or 0 for c in columns]
    outlier_penalty = (sum(outlier_counts) / total_cells) if total_cells else 0

    quality_score = max(0.0, min(100.0, round(
        (completeness * 70) + ((1 - duplicate_penalty) * 20) + ((1 - outlier_penalty) * 10),
        1
    )))

    return {
        "row_count": total_rows,
        "column_count": len(df.columns),
        "duplicate_row_count": duplicate_count,
        "quality_score": quality_score,
        "columns": columns,
    }