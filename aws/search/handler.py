from aws_lambda_powertools import Logger, Metrics, Tracer
from aws_lambda_powertools.event_handler import LambdaFunctionUrlResolver
from aws_lambda_powertools.event_handler.exceptions import BadRequestError
from aws_lambda_powertools.utilities.typing import LambdaContext
from embeddings import search_highlights

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

    results = search_highlights(query)

    return {"message": "Search executed successfully", "results": results}


@logger.inject_lambda_context
@metrics.log_metrics  # ensures metrics are flushed upon request completion/failure
@tracer.capture_lambda_handler
def lambda_handler(event, context: LambdaContext):
    return app.resolve(event, context)
