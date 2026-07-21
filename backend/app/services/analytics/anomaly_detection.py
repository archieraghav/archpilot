import pandas as pd
from sklearn.ensemble import IsolationForest


def detect_column_anomalies(df: pd.DataFrame) -> dict[str, list[int]]:
    numeric_df = df.select_dtypes(include="number").dropna(axis=1, how="all")
    if numeric_df.empty or len(numeric_df) < 5:
        return {}

    anomalies: dict[str, list[int]] = {}

    for col in numeric_df.columns:
        series = numeric_df[[col]].dropna()
        if len(series) < 5:
            continue

        model = IsolationForest(contamination=0.05, random_state=42)
        preds = model.fit_predict(series)
        anomaly_indices = series.index[preds == -1].tolist()

        if anomaly_indices:
            anomalies[col] = anomaly_indices

    return anomalies


def detect_categorical_concentration(df: pd.DataFrame, threshold: float = 0.5) -> dict[str, dict]:
    concentration: dict[str, dict] = {}
    categorical_cols = df.select_dtypes(exclude="number").columns

    for col in categorical_cols:
        counts = df[col].value_counts(normalize=True)
        if counts.empty:
            continue
        top_share = counts.iloc[0]
        if top_share >= threshold:
            concentration[col] = {"top_value": str(counts.index[0]), "share": round(float(top_share), 2)}

    return concentration