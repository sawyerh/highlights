import numpy as np
from services.search import search_highlights


def mock_get_embedding():
    return np.array([0.2, 0.3, 0.4])


def test_search_highlights(mocker, embeddings):
    mocker.patch(
        "services.search.get_embeddings_from_s3",
        return_value=embeddings,
    )
    mocker.patch("services.search.get_embedding", return_value=mock_get_embedding())

    results = search_highlights("This is a test")

    # Max length
    assert len(results) == 50
    # Sorted by similarity and includes the body
    assert results[0]["highlight_key"] == "mock-highlight-0"
    # Does not include the embedding field
    assert "embedding" not in results[0]
