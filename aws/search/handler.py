from aws_lambda_powertools import Logger, Metrics, Tracer
from aws_lambda_powertools.event_handler import LambdaFunctionUrlResolver
from aws_lambda_powertools.event_handler.exceptions import BadRequestError
from aws_lambda_powertools.utilities.data_classes import (
    LambdaFunctionUrlEvent,
    event_source,
)
from aws_lambda_powertools.utilities.typing import LambdaContext
from embeddings import get_embeddings_from_s3, search_highlights

app = LambdaFunctionUrlResolver(
    debug=False,
)
logger = Logger()
metrics = Metrics()
tracer = Tracer()


@app.get("/search", compress=True)
@tracer.capture_method
def get_search():
    query = app.current_event.get_query_string_value("query")
    logger.info("Received search request", extra={"query": query})

    if not query:
        raise BadRequestError("Missing query parameter")

    embeddings = get_embeddings_from_s3(Bucket="sawyer-sandbox", Key="embeddings.json")
    results = search_highlights(query, embeddings)

    return {"message": "Search executed successfully", "results": results}


@event_source(data_class=LambdaFunctionUrlEvent)
@logger.inject_lambda_context
@metrics.log_metrics  # ensures metrics are flushed upon request completion/failure
@tracer.capture_lambda_handler
def lambda_handler(event: LambdaFunctionUrlEvent, context: LambdaContext):
    return app.resolve(event, context)
