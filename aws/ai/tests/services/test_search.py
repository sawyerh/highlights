import numpy as np
import pandas as pd
import pytest
import services.search as summarize


def mock_get_embedding(text: str):
    return np.array([0.2, 0.3, 0.4])


def mock_get_embeddings_from_s3():
    embeddings = []
    for i in range(100):
        embeddings.append(
            {
                "embedding": np.array([0.1, 0.2, 0.3])
                - np.array([0.001 * i, 0.001 * i, 0.001 * i]),
                "body": f"Mock body {i + 1}",
            }
        )

    return pd.DataFrame(embeddings)


@pytest.fixture
def mock_embeddings(monkeypatch):
    monkeypatch.setattr(summarize, "get_embedding", mock_get_embedding)
    monkeypatch.setattr(
        summarize, "get_embeddings_from_s3", mock_get_embeddings_from_s3
    )


def test_search_highlights(mock_embeddings):
    results = summarize.search_highlights("This is a test")

    # Max length
    assert len(results) == 50
    # Sorted by similarity and includes the body
    assert results[0]["body"] == "Mock body 1"
    # Does not include the embedding field
    assert "embedding" not in results[0]
