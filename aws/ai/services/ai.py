from typing import List, Literal, Optional

import anthropic
from aws_lambda_powertools import Logger, Metrics
from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_random_exponential

EMBEDDINGS_ENGINE = "text-embedding-ada-002"

ac_client = anthropic.Anthropic()
openai_client = OpenAI()
logger = Logger()
metrics = Metrics()


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

    response = openai_client.embeddings.create(
        input=list_of_text, model=EMBEDDINGS_ENGINE
    )

    return [d.embedding for d in response.data]


def get_chat_completion(
    user_message: str,
    system_message: Optional[str] = None,
    tool_name: Optional[Literal["summarize_highlights"]] = None,
):
    client = ac_client
    model = "claude-3-5-sonnet-20240620"
    tool_choice = {"type": "tool", "name": tool_name} if tool_name else None

    logger.debug(
        "Chat completion prompts",
        extra={"system_message": system_message, "user_message": user_message},
    )

    message = client.messages.create(
        model=model,
        system=system_message,
        messages=[
            {
                "role": "user",
                "content": user_message,
            },
        ],
        max_tokens=4096,
        temperature=0,
        tool_choice=tool_choice,
        tools=[
            {
                "name": "summarize_highlights",
                "description": "Output a summary of reading highlights as a list of takeaways",
                "input_schema": {
                    "type": "object",
                    "required": ["takeaways"],
                    "properties": {
                        "takeaways": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "takeaway": {
                                        "type": "string",
                                        "description": "A summary for a highlight or set of highlights",
                                    },
                                    "highlight_ids": {
                                        "type": "array",
                                        "items": {
                                            "type": "string",
                                            "description": "ID of the highlight related to this takeaway",
                                        },
                                    },
                                },
                                "required": ["takeaway", "highlight_ids"],
                            },
                        },
                    },
                },
            }
        ],
    )

    return message.content[0]
