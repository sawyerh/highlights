/**
 * @file Data fetching methods for use only on the server.
 * Methods return the data with the appropriate type.
 */
import "server-only";

const FIREBASE_API_URL = process.env.FIREBASE_API_URL;

// Volume covers or titles are often modified after initial import,
// so allow a revalidation period.
const VOLUME_REVALIDATION_TIME = 60 * 10; // 10 minutes

/**
 * Wrapper around `fetch` that returns the JSON body.
 * @example request('https://example.com/api/v1/users')
 */
async function request(path: string, options?: RequestInit) {
	const response = await fetch(path, options);
	const json = await response.json();
	return json;
}

/**
 * Send a request to a serverless HTTP endpoint in Firebase.
 * @example firebaseRequest('volumes')
 */
async function firebaseRequest(route: string, options?: RequestInit) {
	return request(`${FIREBASE_API_URL}/${route}`, options);
}

export async function getVolumes() {
	const { data } = await firebaseRequest("volumes", {
		next: {
			revalidate: VOLUME_REVALIDATION_TIME,
		},
	});

	return { volumes: data as Volume[] };
}

export async function getVolume(volumeId: string) {
	const volume = await firebaseRequest(`volumes/${volumeId}`, {
		next: {
			revalidate: VOLUME_REVALIDATION_TIME,
		},
	});

	return volume as Volume;
}

export async function getHighlights(volumeId: string) {
	const { data } = await firebaseRequest(`highlights?volume=${volumeId}`);

	return data as Highlight[];
}

export async function getHighlight(highlightId: string) {
	const highlight = await firebaseRequest(`highlights/${highlightId}`);

	return highlight as Highlight;
}
