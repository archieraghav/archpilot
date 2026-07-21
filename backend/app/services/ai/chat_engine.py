import uuid

import pandas as pd
from sqlalchemy.orm import Session

from app.models.chat import ChatMessage
from app.services.dataset_service import get_dataset, _read_dataframe
from app.services.embedding_service import retrieve_relevant_context
from app.services.ai.llm_provider import generate_response

SYSTEM_PROMPT = """You are ArchPilot, an AI business intelligence analyst.
You answer questions about a specific uploaded business dataset using the
numerical summary and schema context provided to you. Be precise, cite
actual numbers from the data summary when relevant, and give concise,
business-focused reasoning. If the data doesn't support an answer, say so
clearly instead of guessing."""


def _build_data_summary(df: pd.DataFrame) -> str:
    numeric_cols = df.select_dtypes(include="number").columns
    summary_lines = [f"Dataset has {len(df)} rows and {len(df.columns)} columns."]

    for col in numeric_cols:
        summary_lines.append(
            f"'{col}': min={df[col].min()}, max={df[col].max()}, "
            f"mean={round(df[col].mean(), 2)}, sum={round(df[col].sum(), 2)}"
        )

    return "\n".join(summary_lines)


def answer_query(db: Session, owner_id: uuid.UUID, dataset_id: uuid.UUID, query: str) -> str:
    dataset = get_dataset(db, owner_id, dataset_id)
    df = _read_dataframe(dataset.file_path, f".{dataset.file_type}")

    data_summary = _build_data_summary(df)
    context_chunks = retrieve_relevant_context(db, dataset_id, query, top_k=5)
    context_text = "\n".join(context_chunks)

    user_prompt = f"""Dataset: {dataset.name}

Schema and column context:
{context_text}

Numerical summary:
{data_summary}

Question: {query}"""

    answer = generate_response(SYSTEM_PROMPT, user_prompt)

    db.add(ChatMessage(dataset_id=dataset_id, owner_id=owner_id, role="user", content=query))
    db.add(ChatMessage(dataset_id=dataset_id, owner_id=owner_id, role="assistant", content=answer))
    db.commit()

    return answer


def get_chat_history(db: Session, owner_id: uuid.UUID, dataset_id: uuid.UUID) -> list[ChatMessage]:
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.dataset_id == dataset_id, ChatMessage.owner_id == owner_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )