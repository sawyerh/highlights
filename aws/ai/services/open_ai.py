import os

import openai
from aws_lambda_powertools import Logger, Metrics
from aws_lambda_powertools.metrics import MetricUnit

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

logger = Logger()
metrics = Metrics()


def track_total_tokens(response):
    total_tokens = response["usage"]["total_tokens"]
    metrics.add_metric(
        name="QueryTotalTokens", unit=MetricUnit.Count, value=total_tokens
    )


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
    track_total_tokens(response)

    return response["data"][0]["embedding"]


def get_chat_completion(system_message: str, user_message: str):
    logger.debug(
        "Chat completion prompts",
        extra={"system_message": system_message, "user_message": user_message},
    )

    response = openai.ChatCompletion.create(
        messages=[
            {
                "role": "system",
                "content": system_message,
            },
            {
                "role": "user",
                "content": user_message,
            },
        ],
        model="gpt-3.5-turbo-16k",
        temperature=0.1,
    )
    track_total_tokens(response)

    return response["choices"][0]["message"]["content"]
