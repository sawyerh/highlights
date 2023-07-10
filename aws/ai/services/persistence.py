import os

import awswrangler as wr
from aws_lambda_powertools import Tracer

EMBEDDINGS_S3_BUCKET = os.environ.get("EMBEDDINGS_S3_BUCKET")
EMBEDDINGS_S3_KEY = os.environ.get("EMBEDDINGS_S3_KEY")
tracer = Tracer()


@tracer.capture_method(capture_response=False)
def get_embeddings_from_s3():
    s3_path = f"s3://{EMBEDDINGS_S3_BUCKET}/{EMBEDDINGS_S3_KEY}"
    data_frame = wr.s3.read_parquet(path=[s3_path])

    return data_frame
