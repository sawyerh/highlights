import schemas
from aws_lambda_powertools import Logger, Metrics, Tracer
from aws_lambda_powertools.event_handler import LambdaFunctionUrlResolver
from aws_lambda_powertools.event_handler.exceptions import BadRequestError
from aws_lambda_powertools.utilities.typing import LambdaContext
from aws_lambda_powertools.utilities.validation import SchemaValidationError, validate
from services.embeddings import add_new_embeddings_for_highlights
from services.search import search_highlights
from services.summarize import summarize_volume

app = LambdaFunctionUrlResolver(
    debug=False,
)
logger = Logger()
metrics = Metrics()
tracer = Tracer()


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

    request_data: dict = app.current_event.json_body

    try:
        validate(event=request_data, schema=schemas.POST_EMBEDDINGS_BODY)
        highlights = request_data.get("highlights")
        logger.info(
            "Received embeddings creation request",
            extra={"total_highlights": len(highlights)},
        )
        add_new_embeddings_for_highlights(highlights)
    except SchemaValidationError as exception:
        raise BadRequestError(str(exception))


@logger.inject_lambda_context
@metrics.log_metrics  # ensures metrics are flushed upon request completion/failure
@tracer.capture_lambda_handler
def lambda_handler(event, context: LambdaContext):
    return app.resolve(event, context)
