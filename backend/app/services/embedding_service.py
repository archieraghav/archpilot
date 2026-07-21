import uuid
from functools import lru_cache

import pandas as pd
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session

from app.models.embedding import DatasetEmbedding
from app.services.dataset_service import get_dataset, _read_dataframe


@lru_cache
def get_embedding_model() -> SentenceTransformer:
    return SentenceTransformer("all-MiniLM-L6-v2")


def _build_schema_chunks(df: pd.DataFrame, dataset_name: str) -> list[tuple[str, str]]:
    chunks = []

    columns_summary = ", ".join(
        f"{col} ({df[col].dtype})" for col in df.columns
    )
    chunks.append(("schema", f"Dataset '{dataset_name}' has columns: {columns_summary}"))

    for col in df.columns:
        series = df[col]
        if pd.api.types.is_numeric_dtype(series):
            desc = (
                f"Column '{col}' is numeric. "
                f"Range: {series.min()} to {series.max()}, mean: {round(series.mean(), 2)}."
            )
        else:
            sample_values = series.dropna().astype(str).unique()[:5]
            desc = f"Column '{col}' contains categorical values such as: {', '.join(sample_values)}."
        chunks.append(("column", desc))

    return chunks


def generate_dataset_embeddings(db: Session, owner_id: uuid.UUID, dataset_id: uuid.UUID) -> int:
    dataset = get_dataset(db, owner_id, dataset_id)
    df = _read_dataframe(dataset.file_path, f".{dataset.file_type}")

    db.query(DatasetEmbedding).filter(DatasetEmbedding.dataset_id == dataset.id).delete()

    chunks = _build_schema_chunks(df, dataset.name)
    model = get_embedding_model()

    texts = [text for _, text in chunks]
    vectors = model.encode(texts, convert_to_numpy=True)

    for (chunk_type, text), vector in zip(chunks, vectors):
        db.add(DatasetEmbedding(
            dataset_id=dataset.id,
            chunk_type=chunk_type,
            chunk_text=text,
            embedding=vector.tolist(),
        ))

    db.commit()
    return len(chunks)


def retrieve_relevant_context(db: Session, dataset_id: uuid.UUID, query: str, top_k: int = 5) -> list[str]:
    model = get_embedding_model()
    query_vector = model.encode(query, convert_to_numpy=True)

    embeddings = db.query(DatasetEmbedding).filter(DatasetEmbedding.dataset_id == dataset_id).all()
    if not embeddings:
        return []

    import numpy as np
    scored = []
    for emb in embeddings:
        vec = np.array(emb.embedding)
        similarity = np.dot(query_vector, vec) / (np.linalg.norm(query_vector) * np.linalg.norm(vec) + 1e-8)
        scored.append((similarity, emb.chunk_text))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [text for _, text in scored[:top_k]]