import pandas as pd

from aws.ai.services.embeddings import get_embeddings_for_highlights


def read_highlights_export():
    data_frame = pd.read_json("tmp/query_export.json", lines=True)
    print(f"Found {len(data_frame)} exported highlights")

    return data_frame


def run():
    data_frame = read_highlights_export()
    updated_data_frame = get_embeddings_for_highlights(data_frame)
    updated_data_frame.to_parquet("tmp/embeddings.parquet", compression="gzip")

    print(f"Exported {len(updated_data_frame['embeddings'])} highlights")


run()
