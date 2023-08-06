import fetch from "node-fetch";

import { ParsedVolume } from "./parsing";

/**
 * Add text embeddings so these highlights can be searched and summarized
 */
export async function addEmbeddings(
	highlights: Highlight[],
	volume: ParsedVolume,
) {
	// Trim trailing slash if there is one
	const embeddingsUrl = process.env.AI_FUNCTION_URL
		? process.env.AI_FUNCTION_URL.replace(/\/$/, "")
		: undefined;
	const embeddableHighlights = highlights.map((highlight) => {
		return {
			...highlight,
			highlight_key: highlight.id,
			volume_key: highlight.volume,
			// This means that the title in the embedding is what was originally
			// imported. This is probably not ideal, since sometimes the title
			// changes after import (like getting split into title and subtitle).
			// The app can handle this by looking up by volume_key and using the
			// freshest title from the DB.
			volume_title: volume.title,
		};
	});

	console.log("Adding embeddings", {
		highlights: embeddableHighlights.length,
		volume_title: volume.title,
	});

	if (!embeddingsUrl) {
		console.warn("Not creating embeddings because AI_FUNCTION_URL is not set");
		return;
	}

	const response = await fetch(`${embeddingsUrl}/embeddings`, {
		method: "POST",
		body: JSON.stringify({ highlights: embeddableHighlights }),
		headers: {
			"X-Api-Key": process.env.AI_API_SECRET ?? "",
		},
	});

	if (response.ok) {
		console.log("Embeddings added");
		return;
	}

	console.error("Error adding embeddings", await response.json());
}
