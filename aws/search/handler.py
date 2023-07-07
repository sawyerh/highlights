import json

from aws_lambda_powertools import Logger
from aws_lambda_powertools.utilities.data_classes import (
    LambdaFunctionUrlEvent,
    event_source,
)
from aws_lambda_powertools.utilities.typing import LambdaContext
from embeddings import get_embeddings_from_s3, search_highlights

logger = Logger()


@event_source(data_class=LambdaFunctionUrlEvent)
@logger.inject_lambda_context(
    # Toggle temporarily to True for debugging:
    log_event=False
)
def lambda_handler(event: LambdaFunctionUrlEvent, context: LambdaContext):
    query = event.get_query_string_value("query")
    logger.info("Received search request", extra={"query": query})

    embeddings = get_embeddings_from_s3(Bucket="sawyer-sandbox", Key="embeddings.json")
    results = search_highlights(query, embeddings)

    body = {"message": "Search executed successfully", "results": results}
    return {"statusCode": 200, "body": json.dumps(body)}
