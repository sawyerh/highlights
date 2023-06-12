import json
import os

import chromadb
from chromadb.config import Settings
from IPython.display import Markdown, display

current_dir = os.getcwd()
highlights_export_path = os.path.join(
    current_dir, "data", "firestore-highlights-export.json"
)

client = chromadb.Client(
    Settings(
        chroma_db_impl="duckdb+parquet",
        persist_directory=os.path.join(current_dir, ".chroma"),
    )
)
client.heartbeat()
collection = client.create_collection(
    name="highlights", get_or_create=True, metadata={"hnsw:space": "cosine"}
)


def import_highlights(limit: int):
    with open(highlights_export_path) as f:
        highlights = json.load(f)

    print(f"Found {len(highlights)} highlights in {highlights_export_path}")
    print(
        f"{collection.count()} highlights are in Chroma collection prior to this import."
    )

    if limit is not None:
        print(f"Limiting import to {limit} highlights")
        highlights = highlights[:limit]

    documents = []
    ids = []
    for highlight in highlights:
        id = highlight["name"]
        existing_ids = collection.get([id]).get("ids")

        # Don't import if it already exists
        if len(existing_ids) > 0:
            continue

        documents.append(highlight["body"])
        ids.append(id)

    if len(documents) == 0:
        print("Chroma collection already contains all highlights from Firestore")
    else:
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

    for index, document in enumerate(documents[0]):
        link = f"https://highlights.sawyerh.com/highlights/{ids[0][index]}"
        distance = round(distances[0][index], 2)
        output = f"""
> {document}

— {link}

**Distance**: {distance}
"""
        display(Markdown(output))
