from typing import List

from aws_lambda_powertools import Logger, Tracer
from openai import BaseModel

from services.open_ai import get_chat_completion
from services.persistence import get_embeddings_from_s3

logger = Logger()
tracer = Tracer()


class Summary(BaseModel):
    takeaway: str
    highlight_ids: List[str]


class Summarization(BaseModel):
    summaries: List[Summary]


@tracer.capture_method(capture_response=False)
def summarize_volume(volume_key: str):
    embeddings = get_embeddings_from_s3()
    data = embeddings.loc[lambda x: x["volume_key"] == volume_key].copy()
    logger.info(
        "Filtered by volume key",
        extra={"volume_key": volume_key, "total_found": len(data)},
    )

    data["prompt"] = data["body"] + "\nHighlight ID: " + data["highlight_key"]
    user_prompt = "\n---\n".join(data["prompt"])

    system_prompt = (
        "You are a helpful reading assistant."
        + ' You will be given a set of highlights separated by "---".'
        + ' Each highlight ends with its "Highlight ID".'
        + " Format your response as valid JSON, where there is a `takeaway` string property and `highlight_ids` array property."  # noqa: E501
        + " The `highlight_ids` array should include the highlight ID(s) you used for forming the takeaway."  # noqa: E501
        + " Respond with a maximum of 10 takeaways."  # noqa: E501
    )

    completion = get_chat_completion(system_prompt, user_prompt, Summarization)
    summaries = completion.parsed.summaries

    if isinstance(summaries, list):
        summaries.sort(key=lambda x: len(x.highlight_ids), reverse=True)

    return [summary.model_dump() for summary in summaries]
