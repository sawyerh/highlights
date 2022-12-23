import {
	DocumentData,
	DocumentReference,
	QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import { File } from "@google-cloud/storage";

import fetch from "node-fetch";

import confidentInResult from "./volume/confidentInResult";

/**
 * Convert Google Books API response into a shape
 * to be stored in Firestore
 * @returns Data ready to set on the Volume
 */
async function convertGoogleBookToVolumeAttrs(
	gVolume: GoogleBooksApiVolume,
): Promise<Partial<Volume>> {
	const volumeInfo = gVolume.volumeInfo;
	const imageLinks = volumeInfo.imageLinks;

	const data: Record<string, unknown> = {
		title: volumeInfo.title,
		authors: volumeInfo.authors,
		googleBook: {
			kind: gVolume.kind,
			id: gVolume.id,
			etag: gVolume.etag,
			selfLink: gVolume.selfLink,
		},
	};

	const fieldsWeWant: Array<keyof GoogleBooksApiVolume["volumeInfo"]> = [
		"mainCategory",
		"categories",
		"description",
		"subtitle",
		"pageCount",
		"publisher",
		"publishedDate",
		"industryIdentifiers",
		"previewLink",
	];

	fieldsWeWant.forEach((prop) => {
		const val = volumeInfo[prop];
		if (val) {
			data[prop] = val;
		}
	});

	if (imageLinks) {
		data.image = await saveLargestGoogleImageToFirebase(gVolume.id, imageLinks);
	}
	return data;
}

/**
 * Create our own copy of the book cover
 */
async function saveLargestGoogleImageToFirebase(
	googleId: string,
	images: GoogleBooksApiVolume["volumeInfo"]["imageLinks"],
): Promise<string | null> {
	let largestImageUrl;

	// Get the biggest available to us
	const imageSizes: Array<keyof typeof images> = [
		"extraLarge",
		"large",
		"medium",
		"small",
		"thumbnail",
	];

	imageSizes.some((name) => {
		if (images[name]) {
			largestImageUrl = images[name];
			return true;
		}
		return false;
	});

	if (!largestImageUrl) return Promise.resolve(null);

	const key = `volume/covers/${googleId}`;
	const bucket = getStorage().bucket();
	const file = bucket.file(key);
	const [exists] = await file.exists();

	if (!exists) {
		try {
			await saveUrlAsFirebaseFile(largestImageUrl, file, {
				gBookImage: largestImageUrl,
				gBookId: googleId,
			});
		} catch (error) {
			console.log("Error uploading cover file");
			console.log(error);
		}
	}

	return key;
}

/**
 * Upload the cover to Firebase Storage
 */
async function saveUrlAsFirebaseFile(
	sourceUrl: string,
	firebaseFile: File,
	customMetadata: { [key: string]: string },
) {
	const response = await fetch(sourceUrl);

	const stream = firebaseFile.createWriteStream({
		contentType: response.headers.get("content-type") ?? undefined,
		metadata: { customMetadata },
	});

	return new Promise((resolve, reject) => {
		response.body.pipe(stream);

		stream.on("finish", async () => {
			resolve(firebaseFile);
		});

		stream.on("error", reject);
	});
}

/**
 * Search Google Books using the volume's title and author
 * @return Top search result if present
 */
async function search(data: DocumentData) {
	const title = encodeURIComponent(data.title);
	const author = data.authors
		? encodeURIComponent(data.authors.join(" "))
		: null;
	const authorQuery = author ? `+inauthor:${author}` : "";

	// https://developers.google.com/books/docs/v1/using#PerformingSearch
	const res = await fetch(
		`https://www.googleapis.com/books/v1/volumes?maxResults=1&langRestrict=en&country=US&q=intitle:${title}${authorQuery}`,
	);

	// https://developers.google.com/books/docs/v1/reference/volumes#resource
	const body = await res.json();

	console.log(
		"Received Google Books API response with %d items",
		body.totalItems,
	);
	if (body.totalItems > 0) return body.items[0] as GoogleBooksApiVolume;
}

/**
 * Get the Volume from Google Books API. This returns more info
 * than what's returned as a search result, like more specific
 * categories and larger images.
 */
async function getGoogleVolume(id: string): Promise<GoogleBooksApiVolume> {
	console.log("Found Google Book with ID", id);

	// https://developers.google.com/books/docs/v1/using#RetrievingVolume
	const res = await fetch(
		`https://www.googleapis.com/books/v1/volumes/${id}?country=US`,
	);

	const body = await res.json();

	// https://developers.google.com/books/docs/v1/reference/volumes#resource
	return body as GoogleBooksApiVolume;
}

async function updateVolume(
	ref: DocumentReference,
	gVolume: GoogleBooksApiVolume,
) {
	console.log(
		`Updating Volume ${ref.id} with Google Book (${gVolume.id}) response`,
	);

	const data = await convertGoogleBookToVolumeAttrs(gVolume);
	return ref.set(data, { merge: true });
}

/**
 * Run a volume's title and author info through Google Books API to
 * retrieve additional metadata
 */
async function handleVolumeCreate(snap: QueryDocumentSnapshot) {
	const volume = snap.data();
	console.log("handleVolumeCreate", snap.ref.id, volume.title);

	// Does this volume already have info from Google Books?
	if (volume.googleBook) return;

	try {
		const result = await search(volume);
		if (result) {
			if (confidentInResult(volume, result)) {
				const gVolume = await getGoogleVolume(result.id);
				return updateVolume(snap.ref, gVolume);
			}

			return console.log(
				"Not confident the result is the volume we're looking for.",
				volume.title,
				volume.authors,
				snap.ref.id,
			);
		}
	} catch (err) {
		console.error(err);
	}

	return console.log(
		"No results found for",
		volume.title,
		volume.authors,
		snap.ref.id,
	);
}

export default handleVolumeCreate;
