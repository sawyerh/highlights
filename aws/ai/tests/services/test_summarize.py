import pandas as pd
from pytest_mock import MockerFixture
from services.summarize import summarize_volume

MOCK_CHAT_COMPLETION = """[
    {
        "takeaway": "Takeaway 1",
        "highlight_ids": ["LoLCcYSfAQ4jcE8zTVOM"]
    },
    {
        "takeaway": "Takeaway 2",
        "highlight_ids": ["LoLCcYSfAQ4jcE8zTVOM"]
    }
]"""


def test_summarize_volume(mocker: MockerFixture, embeddings: pd.DataFrame):
    new_embeddings = pd.DataFrame(
        [
            {
                "embedding": [0.1, 0.2, 0.3],
                "body": "Mock body 2",
                "highlight_key": "mock-highlight-1",
                "volume_key": "mock-volume-1",
            }
        ]
    )
    embeddings = pd.concat([embeddings, new_embeddings])

    mocker.patch(
        "services.summarize.get_embeddings_from_s3",
        return_value=embeddings,
    )
    mock_get_chat_completion = mocker.patch(
        "services.summarize.get_chat_completion", return_value=MOCK_CHAT_COMPLETION
    )

    results = summarize_volume("mock-volume-1")

    # Concats body and highlight ID for the prompt
    mock_get_chat_completion.assert_called_once_with(
        mocker.ANY,
        "Mock body\nHighlight ID: mock-highlight-1\n---\nMock body 2\nHighlight ID: mock-highlight-1",  # noqa: E501
    )

    # Converts to JSON
    assert isinstance(results, list)
    assert len(results) == 2


def test_summarize_volume_non_json_completion(
    mocker: MockerFixture, embeddings: pd.DataFrame
):
    mocker.patch(
        "services.summarize.get_embeddings_from_s3",
        return_value=embeddings,
    )
    mocker.patch(
        "services.summarize.get_chat_completion", return_value="This is not JSON"
    )

    results = summarize_volume("mock-volume-1")

    # Returns the non-JSON completion as a fallback
    assert results == [
        {
            "takeaway": "This is not JSON",
            "highlight_ids": [],
        }
    ]
