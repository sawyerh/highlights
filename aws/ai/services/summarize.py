from aws_lambda_powertools import Logger, Tracer

from services.ai import get_chat_completion
from services.persistence import get_embeddings_from_s3

logger = Logger()
tracer = Tracer()


@tracer.capture_method(capture_response=False)
def summarize_volume(volume_key: str):
    embeddings = get_embeddings_from_s3()
    data = embeddings.loc[lambda x: x["volume_key"] == volume_key].copy()
    logger.info(
        "Filtered by volume key",
        extra={"volume_key": volume_key, "total_found": len(data)},
    )

    data["xml_highlight"] = (
        f"<highlight id=\"{data['highlight_key']}\">{data['body']}</highlight>"
    )
    highlights_xml = "".join(data["xml_highlight"])

    system_prompt = "You are a helpful reading assistant capable of distilling complex information into simple points."  # noqa E501
    user_message = f"""
You are tasked with summarizing a set of reading highlights into a concise list of key points. Your goal is to distill the main ideas and most important information from the highlights into no more than 10 points.

Here are the reading highlights:

<highlights>
{highlights_xml}
</highlights>

To summarize these highlights effectively:

1. Carefully read through all the highlights.
2. Identify the main themes, key concepts, and most important information.
3. Consolidate related ideas into single, comprehensive points.
4. Prioritize the most crucial information to ensure it's included in the summary.
5. Phrase each point concisely and clearly.

Additional guidelines:
- Aim for 5-10 points. If the highlights are brief or simple, you may use fewer than 10 points. If they are complex, use the full 10 points.
- Ensure each point captures a distinct idea or piece of information.
- Use clear, concise language in each point.
- Maintain the original meaning and intent of the highlights in your summary.
- Do not introduce new information that isn't present in the original highlights.
- If direct quotes are crucial, you may include them, but paraphrase where possible to keep points concise.
"""  # noqa E501

    completion = get_chat_completion(
        user_message, system_prompt, "summarize_highlights"
    )

    return completion.input["takeaways"]
