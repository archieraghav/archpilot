from pydantic import BaseModel


class ForecastPoint(BaseModel):
    period: int
    predicted_value: float
    lower_bound: float
    upper_bound: float


class ForecastResult(BaseModel):
    column: str
    method: str
    historical_points: int
    forecast: list[ForecastPoint]
    explanation: str