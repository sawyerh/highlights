import os
from typing import Optional

import pandas as pd
from openai.embeddings_utils import get_embeddings

EMBEDDINGS_MODEL = "text-embedding-ada-002"
OPENAI_KEY = os.getenv("OPENAI_API_KEY")


def read_highlights_export(limit: Optional[int] = None):
    data_frame = pd.read_json("tmp/query_export.json", lines=True)
    print(f"Found {len(data_frame)} exported highlights")

    if limit is not None:
        print(f"Limiting import to {limit} highlights")
        data_frame = data_frame[:limit]

    return data_frame


def export_embeddings_for_highlights(limit: Optional[int] = None):
    data_frame = read_highlights_export(limit)
    text_bodies = data_frame["body"].tolist()
    embeddings = []

    # OpenAI limits to batches of 2048
    for i in range(0, len(text_bodies), 2000):
        embeddings += get_embeddings(text_bodies[i : i + 2000], EMBEDDINGS_MODEL)

    data_frame["embedding"] = embeddings
    data_frame.to_parquet("tmp/embeddings.parquet", compression="gzip")

    print(f"Exported {len(embeddings)} highlights")


def run():
    export_embeddings_for_highlights()


run()
