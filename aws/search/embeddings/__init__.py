import pandas as pd
from boto3 import client


def get_embeddings_from_s3(Bucket: str, Key: str):
    obj = client("s3").get_object(Bucket=Bucket, Key=Key)
    contents = obj["Body"].read().decode("utf-8")
    return contents


def convert_embeddings_to_data_frame(embeddings_json_contents: str):
    df = pd.read_json(embeddings_json_contents)

    # Remove any highlights that don't have a body
    df["body"] = df["body"].str.strip()
    df = df[df["body"] != ""]

    print(f"Found {len(df)} non-empty highlights")
    return df
