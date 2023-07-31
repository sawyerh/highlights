/**
 * @file Data fetching methods for use only on the server.
 * Methods return the data with the appropriate type.
 */
import { request } from "helpers/request";

import "server-only";

const FIREBASE_API_URL = process.env.FIREBASE_API_URL;

// Volume covers or titles are often modified after initial import,
// so allow a revalidation period.
const VOLUME_REVALIDATION_TIME = 60 * 10; // 10 minutes

/**
 * Send a request to a serverless HTTP endpoint in Firebase.
 * @example firebaseRequest('volumes')
 */
async function firebaseRequest<TResponse>(route: string, options?: RequestInit) {
	return request<TResponse>(`${FIREBASE_API_URL}/${route}`, options);
}

export async function getVolumes() {
	const { data } = await firebaseRequest<{ data: Volume[] }>("volumes", {
		next: {
			revalidate: VOLUME_REVALIDATION_TIME,
		},
	});

	return { volumes: data };
}

export async function getVolume(volumeId: string) {
	const volume = await firebaseRequest<Volume>(`volumes/${volumeId}`, {
		next: {
			revalidate: VOLUME_REVALIDATION_TIME,
		},
	});

	return volume;
}

export async function getHighlights(volumeId: string) {
	const { data } = await firebaseRequest<{ data: Highlight[] }>(`highlights?volume=${volumeId}`);

	return data;
}

export async function getHighlight(highlightId: string) {
	const highlight = await firebaseRequest<Highlight>(`highlights/${highlightId}`);

	return highlight;
}
