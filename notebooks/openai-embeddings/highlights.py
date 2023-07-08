import os
from typing import Optional

import numpy as np
import openai
import pandas as pd
import tiktoken
from dotenv import load_dotenv
from IPython.display import Markdown, display
from openai.embeddings_utils import (
    chart_from_components,
    cosine_similarity,
    get_embedding,
    get_embeddings,
)
from sklearn.manifold import TSNE

load_dotenv()
EMBEDDINGS_MODEL = "text-embedding-ada-002"
GPT_MODEL = "gpt-3.5-turbo"
OPENAI_KEY = os.getenv("OPENAI_API_KEY")

openai.api_key = OPENAI_KEY


def estimate_tokens():
    encoding = tiktoken.encoding_for_model(EMBEDDINGS_MODEL)
    df = read_highlights_export()
    highlights = df["body"].tolist()

    total_tokens = 0
    largest_tokens = 0

    for highlight in highlights:
        num_tokens = len(encoding.encode(highlight))
        total_tokens += num_tokens
        if num_tokens > largest_tokens:
            largest_tokens = num_tokens

    print(f"Total tokens: {total_tokens}")
    print(f"Largest tokens: {largest_tokens}")


def read_highlights_export(limit: Optional[int] = None):
    df = pd.read_json("data/firestore-highlights-export.json")
    # Remove any highlights that don't have a body
    df["body"] = df["body"].str.strip()
    df = df[df["body"] != ""]

    print(f"Found {len(df)} non-empty highlights")

    if limit is not None:
        print(f"Limiting import to {limit} highlights")
        df = df[:limit]

    return df


def read_embeddings_export():
    return pd.read_json("data/highlights-embeddings.json")


def export_embeddings_for_highlights(limit: Optional[int] = None):
    df = read_highlights_export(limit)
    text_bodies = df["body"].tolist()
    embeddings = []

    # OpenAI limits to batches of 2048
    for i in range(0, len(text_bodies), 2000):
        embeddings += get_embeddings(text_bodies[i : i + 2000], EMBEDDINGS_MODEL)

    df["embedding"] = embeddings
    df.to_json("data/highlights-embeddings.json")

    print(f"Exported {len(embeddings)} highlights")


def chart_embeddings():
    """
    Largely based on
    https://github.com/openai/openai-cookbook/blob/main/examples/Visualizing_embeddings_in_2D.ipynb
    """
    df = read_embeddings_export()

    # Reduce the dimensionality to 2 dimensions
    tsne = TSNE(
        n_components=2, perplexity=15, random_state=42, init="random", learning_rate=200
    )
    matrix = np.array(df["embedding"].tolist())
    visual_dimensions = tsne.fit_transform(matrix)

    # Render the chart
    x = [x for x, y in visual_dimensions]
    y = [y for x, y in visual_dimensions]
    labels = df["volume_name"].tolist()
    hover_text = df["body"].tolist()
    components = np.array([x, y]).T
    chart = chart_from_components(components, labels=labels, strings=hover_text)
    chart.show()


def search_highlights(query: str):
    df = read_embeddings_export()
    query_embedding = get_embedding(query, EMBEDDINGS_MODEL)
    df["similarity"] = df.embedding.apply(
        lambda x: cosine_similarity(x, query_embedding)
    )
    results = df.sort_values("similarity", ascending=False).head(10)
    md_output = ""

    for _index, row in results.iterrows():
        link = f"https://highlights.sawyerh.com/highlights/{row['name']}"
        md_output += f"""
> {row.body}

{link}
<hr />
"""

    summarize_highlights(query, md_output)

    display(Markdown(f"**Top 10 results for '{query}':**"))
    display(Markdown(md_output))


def summarize_highlights(query: str, raw_highlights_output: str):
    response = openai.ChatCompletion.create(
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that summarizes the user's reading highlights from book they've read. Given a user's query and raw output related to the user's query, write a 1-3 sentence introductory response, followed by a list of up to 10 key takeaways. Respond using Markdown syntax. Format the intro as bold text, and format each takeaway as a bullet point. At the end of each takeaway, include link(s) to the original highlight(s) using the following format: [🔗](link url).",  # noqa: E501
            },
            {
                "role": "user",
                "content": f"Query: {query}. Raw output:\n{raw_highlights_output}",
            },
        ],
        model=GPT_MODEL,
        temperature=0.1,
    )

    completion = response["choices"][0]["message"]["content"]
    display(Markdown(completion))
