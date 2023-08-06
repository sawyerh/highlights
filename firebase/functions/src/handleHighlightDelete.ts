import fetch from "node-fetch";

async function handleHighlightDelete(
	highlightId: string,
	ai_api: {
		url: string;
		secret: string;
	},
) {
	console.log("Deleting embedding", { highlightId });
	const res = await fetch(`${ai_api.url}/embeddings`, {
		method: "DELETE",
		headers: {
			"X-Api-Key": ai_api.secret,
		},
		body: JSON.stringify({
			highlight_key: highlightId,
		}),
	});

	if (!res.ok) {
		console.error("Failed to delete embedding", {
			highlightId,
			message: await res.json(),
		});
	}
}

export default handleHighlightDelete;
