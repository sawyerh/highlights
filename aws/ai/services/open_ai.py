import os
from typing import List

import openai
from aws_lambda_powertools import Logger, Metrics
from aws_lambda_powertools.metrics import MetricUnit
from tenacity import retry, stop_after_attempt, wait_random_exponential

EMBEDDINGS_ENGINE = "text-embedding-ada-002"
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

    embeddings = get_embeddings([text])
    return embeddings[0]


@retry(wait=wait_random_exponential(min=1, max=20), stop=stop_after_attempt(6))
def get_embeddings(list_of_text: List[str]) -> List[List[float]]:
    """
    Bulk create new embeddings using the OpenAI API.
    This function mostly copied from
    https://github.com/openai/openai-python/blob/main/openai/embeddings_utils.py
    """
    assert len(list_of_text) <= 2048, "The batch size should not be larger than 2048."

    # replace newlines, which can negatively affect performance.
    list_of_text = [text.replace("\n", " ") for text in list_of_text]

    response = openai.Embedding.create(input=list_of_text, engine=EMBEDDINGS_ENGINE)
    track_total_tokens(response)

    return [d["embedding"] for d in response["data"]]


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
