import numpy as np
import pandas as pd
import streamlit as st
from dotenv import load_dotenv
from openai.embeddings_utils import chart_from_components
from sklearn.manifold import TSNE

load_dotenv()
S3_EMBEDDINGS_PATH = "s3://highlights.sawyerh.com/ai/embeddings.parquet"


# ==========================================
# Helper functions
# ==========================================
def get_unique_volumes():
    volume_keys = df.volume_key.unique()
    _volumes = []

    for volume_key in volume_keys:
        volume_df = df[df.volume_key == volume_key]
        volume_title = volume_df.volume_title.iloc[0]
        _volumes.append(
            {
                "volume_key": volume_key,
                "volume_title": volume_title,
            }
        )

    return _volumes


def get_chart(chart_df: pd.DataFrame):
    """
    Largely based on
    https://github.com/openai/openai-cookbook/blob/main/examples/Visualizing_embeddings_in_2D.ipynb
    """

    # Reduce the dimensionality to 2 dimensions
    tsne = TSNE(
        n_components=2, perplexity=15, random_state=42, init="random", learning_rate=200
    )
    matrix = np.array(chart_df["embedding"].tolist())
    visual_dimensions = tsne.fit_transform(matrix)

    # Render the chart
    x = [x for x, y in visual_dimensions]
    y = [y for x, y in visual_dimensions]
    labels = chart_df["volume_title"].tolist()
    hover_text = chart_df["body"].tolist()
    components = np.array([x, y]).T

    figure = chart_from_components(
        components,
        labels=labels,
        strings=hover_text,
        mark_size=10,
        x_title="x",
        y_title="y",
    )
    figure.update_xaxes(showgrid=True)
    figure.update_yaxes(showgrid=True)
    figure.update_layout(
        legend=dict(yanchor="top", y=0.99, xanchor="left", x=0.01, title_text="Book")
    )
    return figure


# ==========================================
# Set up session state to cache data
# ==========================================
if "df" not in st.session_state:
    st.session_state.df = pd.read_parquet(S3_EMBEDDINGS_PATH)
df = st.session_state.df

if "volumes" not in st.session_state:
    st.session_state.volumes = get_unique_volumes()
volumes = st.session_state.volumes


# ==========================================
# Start rendering logic
# ==========================================
st.title("Embeddings")
st.dataframe(df)

st.header("By volume")
st.multiselect(
    "Volumes",
    volumes,
    [
        volumes[0],
        volumes[1],
    ],
    key="selected_volumes",
    format_func=lambda volume: volume["volume_title"],
)

selected_volumes = st.session_state.selected_volumes or []
selected_volume_keys = [volume["volume_key"] for volume in selected_volumes]
selected_volume_df = df[df.volume_key.isin(selected_volume_keys)]

st.plotly_chart(get_chart(selected_volume_df))
st.dataframe(selected_volume_df, use_container_width=True)
