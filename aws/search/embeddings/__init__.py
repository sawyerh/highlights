import os

import awswrangler as wr
import numpy as np
import openai
import pandas as pd
from aws_lambda_powertools import Logger, Metrics, Tracer
from aws_lambda_powertools.metrics import MetricUnit

OPENAI_KEY = os.environ.get("OPENAI_API_KEY")
openai.api_key = OPENAI_KEY

logger = Logger()
metrics = Metrics()
tracer = Tracer()


@tracer.capture_method(capture_response=False)
def get_embedding(text: str):
    """
    Create a new embedding using the OpenAI API.
    This function mostly copied from
    https://github.com/openai/openai-python/blob/main/openai/embeddings_utils.py
    """
    logger.info("Creating embedding", extra={"text": text})

    # replace newlines, which can negatively affect performance.
    text = text.replace("\n", " ")
    response = openai.Embedding.create(input=[text], engine="text-embedding-ada-002")
    total_tokens = response["usage"]["total_tokens"]
    metrics.add_metric(
        name="QueryTotalTokens", unit=MetricUnit.Count, value=total_tokens
    )

    return response["data"][0]["embedding"]


def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


@tracer.capture_method(capture_response=False)
def get_embeddings_from_s3(Bucket: str, Key: str):
    s3_path = f"s3://{Bucket}/{Key}"
    data_frame = wr.s3.read_parquet(path=[s3_path])

    return data_frame


@tracer.capture_method(capture_response=False)
def sort_embeddings_by_similarity(query_embedding, embeddings: pd.DataFrame):
    embeddings["similarity"] = embeddings.embedding.apply(
        lambda x: cosine_similarity(x, query_embedding)
    )
    return embeddings.sort_values(by="similarity", ascending=False)


def search_highlights(query: str, embeddings: pd.DataFrame):
    query_embedding = get_embedding(query)
    raw_results = sort_embeddings_by_similarity(query_embedding, embeddings)
    results = raw_results.head(10).drop(columns=["embedding", "similarity"])

    return results.to_dict(orient="records")
