import json
import os
from typing import Optional

import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
from dotenv import load_dotenv
from IPython.display import Markdown, display

load_dotenv()
current_dir = os.getcwd()
highlights_export_path = os.path.join(
    current_dir, "data", "firestore-highlights-export.json"
)

OPENAI_KEY = os.getenv("OPENAI_KEY")
if OPENAI_KEY is None:
    raise Exception(
        "OPENAI_KEY environment variable is not set. Please set it in a .env file."
    )

openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=OPENAI_KEY, model_name="text-embedding-ada-002"
)
client = chromadb.Client(
    Settings(
        chroma_db_impl="duckdb+parquet",
        persist_directory=os.path.join(current_dir, ".chroma"),
    )
)
collection = client.create_collection(
    name="highlights",
    get_or_create=True,
    embedding_function=openai_ef,
)


def read_highlights_export(limit: Optional[int] = None):
    with open(highlights_export_path) as f:
        highlights = json.load(f)

    print(f"Found {len(highlights)} highlights in {highlights_export_path}")

    if limit is not None:
        print(f"Limiting import to {limit} highlights")
        highlights = highlights[:limit]

    return highlights


def import_highlights(limit: Optional[int] = None):
    highlights = read_highlights_export(limit)
    print(
        f"{collection.count()} highlights are in Chroma collection prior to this import."
    )

    # Break highlights into batches of 500 at most to address OpenAI limits?
    batch_size = 500
    batches = [
        highlights[i : i + batch_size] for i in range(0, len(highlights), batch_size)
    ]

    for batch in batches:
        documents = []
        ids = []
        for highlight in batch:
            id = highlight["name"]
            existing_ids = collection.get([id]).get("ids")

            # Don't import if it already exists or is too short
            if len(existing_ids) > 0 or len(highlight["body"]) < 10:
                continue
            documents.append(highlight["body"])
            ids.append(id)

        if len(documents) == 0:
            print("Chroma collection already contains all highlights from Firestore")
            return

        collection.add(documents=documents, ids=ids)
        client.persist()
        print(f"Added {len(documents)} new highlights to Chroma collection")


def search_highlights(query: str):
    if collection.count() == 0:
        raise Exception("Chroma collection is empty. Run import_highlights() first.")

    print(f"Searching for '{query}' in Chroma collection")
    results = collection.query(query_texts=[query], n_results=10)
    ids = results.get("ids", [])
    documents = results.get("documents", [])
    distances = results.get("distances", [])

    display(Markdown("### Results:"))

    for index, document in enumerate(documents[0]):
        link = f"https://highlights.sawyerh.com/highlights/{ids[0][index]}"
        distance = round(distances[0][index], 2)
        output = f"""
> {document}

— {link}

_Distance_: {distance}
"""
        display(Markdown(output))
