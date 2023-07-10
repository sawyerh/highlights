import "server-only";

const API_URL = process.env.API_URL;

/**
 * Wrapper around `fetch` that returns the JSON body.
 * @example request('volumes');
 */
async function request(apiRoute: string, options?: RequestInit) {
	const response = await fetch(`${API_URL}/${apiRoute}`, options);
	const json = await response.json();
	return json;
}

export async function getVolumes() {
	const { data } = await request("volumes", {
		next: {
			revalidate: 60 * 10, // 10 minutes
		},
	});

	return { volumes: data as Volume[] };
}

export async function getVolume(volumeId: string) {
	const volume = await request(`volumes/${volumeId}`);

	return volume as Volume;
}

export async function getHighlights(volumeId: string) {
	const { data } = await request(`highlights?volume=${volumeId}`);

	return data as Highlight[];
}

export async function getHighlight(highlightId: string) {
	const highlight = await request(`highlights/${highlightId}`);

	return highlight as Highlight;
}
