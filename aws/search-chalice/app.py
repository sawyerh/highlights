from chalice import Chalice
from chalicelib import convert_embeddings_to_data_frame, get_embeddings_from_s3

app = Chalice(app_name="highlights-search")


@app.route("/")
def index():
    json = get_embeddings_from_s3(Bucket="sawyer-sandbox", Key="embeddings.json")
    df = convert_embeddings_to_data_frame(json)

    # First ten highlights
    highlights = df.head(10).to_dict(orient="records")
    return {"highlights": highlights}
