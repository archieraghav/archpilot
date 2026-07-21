import numpy as np
import pandas as pd
from fastapi import HTTPException, status
from statsmodels.tsa.holtwinters import ExponentialSmoothing


def forecast_column(df: pd.DataFrame, column: str, periods: int = 3) -> dict:
    if column not in df.columns:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Column '{column}' not found")

    series = pd.to_numeric(df[column], errors="coerce").dropna()

    if len(series) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Need at least 4 historical data points to generate a forecast",
        )

    series = series.reset_index(drop=True)

    try:
        model = ExponentialSmoothing(
            series,
            trend="add",
            seasonal=None,
            initialization_method="estimated",
        )
        fitted = model.fit()
        predictions = fitted.forecast(periods)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not generate a forecast for this column — check that it contains enough numeric variation",
        )

    residuals = fitted.resid
    std_error = float(np.std(residuals)) if len(residuals) > 1 else float(series.std()) * 0.1
    margin = 1.96 * std_error

    forecast_points = []
    for i, value in enumerate(predictions, start=1):
        forecast_points.append({
            "period": i,
            "predicted_value": round(float(value), 2),
            "lower_bound": round(float(value) - margin, 2),
            "upper_bound": round(float(value) + margin, 2),
        })

    last_value = float(series.iloc[-1])
    first_forecast = forecast_points[0]["predicted_value"]
    direction = "increase" if first_forecast > last_value else "decrease"
    percent_change = abs(round(((first_forecast - last_value) / last_value) * 100, 1)) if last_value != 0 else 0

    explanation = (
        f"Based on {len(series)} historical data points, {column} is projected to {direction} "
        f"by approximately {percent_change}% in the next period. This uses exponential smoothing, "
        f"which weighs recent values more heavily and assumes the recent trend continues. "
        f"The shaded range reflects normal uncertainty — actual results may vary, especially "
        f"with limited historical data."
    )

    return {
        "column": column,
        "method": "holt-winters exponential smoothing",
        "historical_points": len(series),
        "forecast": forecast_points,
        "explanation": explanation,
    }