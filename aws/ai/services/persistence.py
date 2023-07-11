import os

import awswrangler as wr
import pandas as pd
from aws_lambda_powertools import Logger, Tracer

EMBEDDINGS_S3_BUCKET = os.environ.get("EMBEDDINGS_S3_BUCKET")
EMBEDDINGS_S3_KEY = os.environ.get("EMBEDDINGS_S3_KEY")
EMBEDDINGS_S3_PATH = f"s3://{EMBEDDINGS_S3_BUCKET}/{EMBEDDINGS_S3_KEY}"

logger = Logger()
tracer = Tracer()


@tracer.capture_method(capture_response=False)
def get_embeddings_from_s3():
    return wr.s3.read_parquet(path=[EMBEDDINGS_S3_PATH])


@tracer.capture_method(capture_response=False)
def save_embeddings_to_s3(updated_highlights: pd.DataFrame):
    wr.s3.to_parquet(
        updated_highlights,
        path=EMBEDDINGS_S3_PATH,
        compression="gzip",
    )
