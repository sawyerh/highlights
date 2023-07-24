import pandas as pd
from pytest_mock import MockerFixture
from services.embeddings import (
    add_new_embeddings_for_highlights,
    filter_existing_highlights,
)


def test_filter_existing_highlights():
    new_df = pd.DataFrame(
        [{"highlight_key": "1", "body": "foo"}, {"highlight_key": "2", "body": "bar"}]
    )
    existing_df = pd.DataFrame([{"highlight_key": "1", "body": "foo"}])
    results = filter_existing_highlights(new_df, existing_df)

    assert len(results) == 1
    assert results["highlight_key"].tolist() == ["2"]


def test_add_new_embeddings_for_highlights(
    mocker: MockerFixture, embeddings: pd.DataFrame
):
    mock_embedding = [0.1, 0.2, 0.3]
    mock_save_embeddings_to_s3 = mocker.patch(
        "services.embeddings.save_embeddings_to_s3"
    )
    mocker.patch(
        "services.embeddings.get_embeddings_from_s3",
        return_value=embeddings,
    )
    mocker.patch("services.embeddings.get_embeddings", return_value=[mock_embedding])

    existing_highlight = embeddings.iloc[0]
    highlights = [
        existing_highlight.to_dict(),
        {
            "body": "Mock body 1",
            "highlight_key": "new-mock-highlight",
            "volume_key": "mock-volume-1",
            "volume_title": "Mock volume 1",
        },
    ]

    add_new_embeddings_for_highlights(highlights)
    appending_highlights: pd.DataFrame = mock_save_embeddings_to_s3.call_args[0][0]

    assert len(appending_highlights) == len(embeddings) + 1
    assert (
        appending_highlights.iloc[len(appending_highlights) - 1].loc["highlight_key"]
        == "new-mock-highlight"
    )
