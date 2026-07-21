import uuid
from datetime import datetime

from pydantic import BaseModel


class InsightOut(BaseModel):
    id: uuid.UUID
    category: str
    severity: str
    title: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True