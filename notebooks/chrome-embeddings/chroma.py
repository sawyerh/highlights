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
client.persist()
collection = client.create_collection(name="highlights", get_or_create=True)


def import_highlights():
    with open(highlights_export_path) as f:
        highlights = json.load(f)

    print(f"Found {len(highlights)} highlights in {highlights_export_path}")
    print(
        f"{collection.count()} highlights are in Chroma collection prior to this import."
    )

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
        print(f"Added {len(documents)} new highlights to Chroma collection")


def search_highlights(query: str):
    r = collection.count()
    print(r)

    print(f"Searching for '{query}' in Chroma collection")
    results = collection.query(query_texts=[query], n_results=10)

    print(results)

    ids = results.get("ids")
    documents = results.get("documents", [])

    for index, document in enumerate(documents[0]):
        link = f"https://highlights.sawyerh.com/highlights/{ids[0][index]}"
        display(Markdown(document), link)
