import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatMessageOut
from app.services.ai import chat_engine

router = APIRouter(prefix="/datasets", tags=["Chat"])


@router.post("/{dataset_id}/chat")
def chat_with_dataset(
    dataset_id: uuid.UUID,
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    answer = chat_engine.answer_query(db, current_user.id, dataset_id, payload.message)
    return {"answer": answer}


@router.get("/{dataset_id}/chat/history", response_model=list[ChatMessageOut])
def get_chat_history(
    dataset_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return chat_engine.get_chat_history(db, current_user.id, dataset_id)