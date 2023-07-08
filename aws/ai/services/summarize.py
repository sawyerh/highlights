import json

from aws_lambda_powertools import Logger, Tracer
from services.open_ai import get_chat_completion
from services.persistence import get_embeddings_from_s3

logger = Logger()
tracer = Tracer()


@tracer.capture_method(capture_response=False)
def validate_and_parse_json_completion(input: str):
    """
    Validate that the input is a JSON where the fields are either a list of strings or a string.
    If it is, return the parsed JSON. Otherwise, return the input string.

    Example:
    >>> validate_and_parse_json_completion('[{"takeaway": "Takeaway 1", "highlight_ids": ["LoLCcYSfAQ4jcE8zTVOM"]}]')
    [{"takeaway": "Takeaway 1", "highlight_ids": ["LoLCcYSfAQ4jcE8zTVOM"]}]
    """  # noqa: E501

    try:
        json_output = json.loads(input)
        if not isinstance(json_output, list):
            return input
        for item in json_output:
            if not isinstance(item, dict):
                return input
            if not isinstance(item.get("takeaway"), str):
                return input
            if not isinstance(item.get("highlight_ids"), list):
                return input
            for highlight_id in item.get("highlight_ids"):
                if not isinstance(highlight_id, str):
                    return input

        return json_output

    except Exception:
        return input


@tracer.capture_method(capture_response=False)
def summarize_volume(volume_key: str):
    embeddings = get_embeddings_from_s3()
    data = embeddings.loc[lambda x: x["volume_key"] == volume_key]
    logger.info(
        "Filtered by volume key",
        extra={"volume_key": volume_key, "total_found": len(data)},
    )

    data.loc[:, "prompt"] = (
        data.loc[:, "body"] + "\nHighlight ID: " + data.loc[:, "highlight_key"]
    )
    user_prompt = "\n---".join(data["prompt"])

    system_prompt = (
        "You are a helpful reading assistant."
        + ' You will be given a set of highlights separated by "---".'
        + 'Each highlight ends with its "Highlight ID".'
        + " Format your response as valid JSON, where there is a `takeaway` string property and `highlight_ids` array property."  # noqa: E501
        + " The `highlight_ids` array should include the highlight ID(s) you used for forming the takeaway."  # noqa: E501
        + ' For example:  [{"takeaway": "Money is green.", "highlight_ids": ["LoLCcYSfAQ4jcE8zTVOM"]}]'  # noqa: E501
        + " Respond with a maximum of 10 takeaways."  # noqa: E501
    )

    completion = get_chat_completion(system_prompt, user_prompt)
    parsed_completion = validate_and_parse_json_completion(completion)

    if isinstance(parsed_completion, list):
        parsed_completion.sort(key=lambda x: len(x["highlight_ids"]), reverse=True)

    return parsed_completion
