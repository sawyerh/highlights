import os

import numpy as np
import pandas as pd
import pytest

os.environ.setdefault("CLIENTS_SECRET", "test-secret")
os.environ.setdefault("OPENAI_API_KEY", "test-secret")


@pytest.fixture
def embeddings():
    embeddings = []
    for i in range(100):
        embeddings.append(
            {
                "embedding": np.array([0.1, 0.2, 0.3])
                - np.array([0.001 * i, 0.001 * i, 0.001 * i]),
                "body": "Mock body",
                "highlight_key": f"mock-highlight-{i}",
                "volume_key": f"mock-volume-{i}",
                "volume_title": f"Mock volume {i}",
            }
        )

    return pd.DataFrame(embeddings)
