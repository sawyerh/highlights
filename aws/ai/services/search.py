import numpy as np
import pandas as pd
from aws_lambda_powertools import Logger, Tracer
from services.open_ai import get_embedding
from services.persistence import get_embeddings_from_s3

logger = Logger()
tracer = Tracer()


def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


@tracer.capture_method(capture_response=False)
def sort_embeddings_by_similarity(query_embedding, embeddings: pd.DataFrame):
    embeddings["similarity"] = embeddings.embedding.apply(
        lambda x: cosine_similarity(x, query_embedding)
    )
    return embeddings.sort_values(by="similarity", ascending=False)


def search_highlights(query: str):
    query_embedding = get_embedding(query)
    embeddings = get_embeddings_from_s3()
    raw_results = sort_embeddings_by_similarity(query_embedding, embeddings)
    results = raw_results.head(10).drop(columns=["embedding", "similarity"])

    return results.to_dict(orient="records")
