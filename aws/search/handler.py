import json

from embeddings import convert_embeddings_to_data_frame, get_embeddings_from_s3


def search(event, context):
    embeddings = get_embeddings_from_s3(Bucket="sawyer-sandbox", Key="embeddings.json")
    df = convert_embeddings_to_data_frame(embeddings)
    highlights = df.head(10).to_dict(orient="records")
    body = {"message": "Function URL executed successfully", "data": highlights}

    return {"statusCode": 200, "body": json.dumps(body)}
