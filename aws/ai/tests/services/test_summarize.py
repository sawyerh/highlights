import pandas as pd
from anthropic import BaseModel
from pytest_mock import MockerFixture
from services.summarize import summarize_volume


class MockCompletion(BaseModel):
    input: dict


MOCK_COMPLETION = MockCompletion(
    input={
        "takeaways": [
            {"takeaway": "Takeaway 1", "highlight_ids": ["LoLCcYSfAQ4jcE8zTVOM"]},
            {"takeaway": "Takeaway 2", "highlight_ids": ["LoLCcYSfAQ4jcE8zTVOM"]},
        ]
    }
)


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
        "services.summarize.get_chat_completion", return_value=MOCK_COMPLETION
    )

    results = summarize_volume("mock-volume-1")

    # Concats body and highlight ID for the prompt
    mock_get_chat_completion.assert_called_once_with(
        mocker.ANY,
        mocker.ANY,
        "summarize_highlights",
    )

    # Converts to JSON
    assert isinstance(results, list)
    assert len(results) == 2
