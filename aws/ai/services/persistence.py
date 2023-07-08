import os

import awswrangler as wr
from aws_lambda_powertools import Tracer

EMBEDDINGS_BUCKET = os.environ.get("EMBEDDINGS_BUCKET")
tracer = Tracer()


@tracer.capture_method(capture_response=False)
def get_embeddings_from_s3():
    s3_path = f"s3://{EMBEDDINGS_BUCKET}/embeddings.parquet"
    data_frame = wr.s3.read_parquet(path=[s3_path])

    return data_frame
