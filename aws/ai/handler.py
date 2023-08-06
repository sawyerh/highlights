import os

import schemas
from aws_lambda_powertools import Logger, Metrics, Tracer
from aws_lambda_powertools.event_handler import LambdaFunctionUrlResolver
from aws_lambda_powertools.event_handler.exceptions import BadRequestError
from aws_lambda_powertools.utilities.typing import LambdaContext
from aws_lambda_powertools.utilities.validation import SchemaValidationError, validate
from services.embeddings import (
    add_new_embeddings_for_highlights,
    remove_highlight_embedding,
)
from services.search import search_highlights
from services.summarize import summarize_volume

CLIENTS_SECRET = os.environ.get("CLIENTS_SECRET")

app = LambdaFunctionUrlResolver(
    debug=False,
)
logger = Logger()
metrics = Metrics()
tracer = Tracer()


@app.get("/wake")
def get_wake():
    """
    Wake up the function from any cold start
    """

    return {"message": "I'm ready!"}


@app.get("/search", compress=True)
@tracer.capture_method
def get_search():
    """
    Search all highlights
    """

    query = app.current_event.get_query_string_value("query")
    logger.info("Received search request", extra={"query": query})

    if not query:
        raise BadRequestError("Missing query parameter")

    results = search_highlights(query)

    return {"message": "Search executed successfully", "data": results}


@app.get("/summarize/<volume_key>", compress=True)
@tracer.capture_method
def get_summarize(volume_key: str):
    """
    Summarize a volume
    """

    logger.info("Received summarization request", extra={"volume_key": volume_key})

    if not volume_key:
        raise BadRequestError("Missing volume_key parameter")

    results = summarize_volume(volume_key)

    return {"message": "Summarization executed successfully", "data": results}


@app.post("/embeddings")
@tracer.capture_method
def post_embeddings():
    """
    Create embeddings for new highlights and append to existing embeddings dataset.
    This endpoint is idempotent, so it should be safe to retry if something fails.
    """

    enforce_clients_secret()
    request_data: dict = app.current_event.json_body

    try:
        validate(event=request_data, schema=schemas.POST_EMBEDDINGS_BODY)
        highlights = request_data.get("highlights")
        logger.info(
            "Received embeddings creation request",
            extra={"total_highlights": len(highlights)},
        )
        add_new_embeddings_for_highlights(highlights)
        return {"message": "Embeddings created successfully"}
    except SchemaValidationError as exception:
        raise BadRequestError(str(exception))


@app.delete("/embeddings")
@tracer.capture_method
def delete_embeddings():
    """
    Remove embeddings for a given highlight_key.

    TODO: This isn't a great approach because there will be race conditions
    updating the embeddings dataset. One option is to set the reserved concurrency
    for the deletion to 1, but that will require moving this endpoint to its own
    function. For now, this works for one-off manual deletions.
    """
    enforce_clients_secret()

    request_data: dict = app.current_event.json_body

    try:
        validate(event=request_data, schema=schemas.DELETE_EMBEDDING_BODY)
        highlight_key = request_data.get("highlight_key")
        logger.info(
            "Received embeddings deletion request",
            extra={"highlight_key": highlight_key},
        )
        remove_highlight_embedding(highlight_key)
        return {"message": "Embedding deleted successfully", "data": highlight_key}
    except SchemaValidationError as exception:
        raise BadRequestError(str(exception))


@logger.inject_lambda_context
@metrics.log_metrics  # ensures metrics are flushed upon request completion/failure
@tracer.capture_lambda_handler
def lambda_handler(event, context: LambdaContext):
    return app.resolve(event, context)


def enforce_clients_secret():
    """
    Enforce the CLIENTS_SECRET environment variable to be set and match the
    one sent in the request
    """

    if not CLIENTS_SECRET:
        logger.error("Missing CLIENTS_SECRET environment variable")
        raise BadRequestError("Missing CLIENTS_SECRET environment variable")

    api_key: str = app.current_event.get_header_value(name="X-Api-Key")

    if not api_key:
        logger.info("Missing client secret")
        raise BadRequestError("Missing client secret")
    if api_key != CLIENTS_SECRET:
        logger.info("Invalid client secret")
        raise BadRequestError("Invalid client secret")
