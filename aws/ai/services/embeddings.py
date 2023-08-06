from typing import List, NamedTuple

import pandas as pd
from aws_lambda_powertools import Logger
from services.open_ai import get_embeddings
from services.persistence import get_embeddings_from_s3, save_embeddings_to_s3

logger = Logger()


class HighlightsPayloadItem(NamedTuple):
    body: str
    highlight_key: str
    volume_key: str
    volume_title: str
    volume_subtitle: str


def add_new_embeddings_for_highlights(highlights_payload: List[HighlightsPayloadItem]):
    """
    Create embeddings for new highlights and append to the persisted dataset.
    """

    highlights = pd.DataFrame(highlights_payload)
    existing_highlights = get_embeddings_from_s3()
    new_highlights = filter_existing_highlights(highlights, existing_highlights)

    if len(new_highlights) == 0:
        logger.info(
            "Not adding any embeddings, because all highlights have embeddings already."  # noqa E501
        )
        return

    updated_highlights = get_embeddings_for_highlights(new_highlights)
    merged_highlights = pd.concat([existing_highlights, updated_highlights])

    save_embeddings_to_s3(merged_highlights)


def get_embeddings_for_highlights(highlights: pd.DataFrame):
    """
    Create embeddings for all highlights in the data frame

    :param highlights: Data frame with highlights
    :return: Data frame with highlights and embeddings
    """

    updated_highlights = highlights.copy()
    text_bodies = updated_highlights["body"].tolist()
    embeddings = []

    # OpenAI limits to batches of 2048
    for i in range(0, len(text_bodies), 2047):
        embeddings += get_embeddings(text_bodies[i : i + 2047])

    updated_highlights["embedding"] = embeddings
    return updated_highlights


def filter_existing_highlights(
    new_highlights: pd.DataFrame, existing_highlights: pd.DataFrame
):
    """
    Remove highlights that are already included in the existing data frame

    :param new_highlights: Data frame with the requested highlights to
        receive embeddings
    :param existing_highlights: Data frame with existing highlights and embeddings
    """

    existing_highlights = existing_highlights["highlight_key"].tolist()
    return new_highlights[~new_highlights["highlight_key"].isin(existing_highlights)]


def remove_highlight_embedding(highlight_key: str):
    """
    Remove a highlight embedding from the persisted dataset

    :param highlight_key: Key of the highlight to remove
    """

    highlights = get_embeddings_from_s3()
    highlights = highlights[~highlights["highlight_key"].isin([highlight_key])]
    save_embeddings_to_s3(highlights)
