import os

import openai
from aws_lambda_powertools import Logger, Metrics
from aws_lambda_powertools.metrics import MetricUnit

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

logger = Logger()
metrics = Metrics()


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
