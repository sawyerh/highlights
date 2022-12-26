import {
	DocumentData,
	DocumentReference,
	QueryDocumentSnapshot,
	Timestamp,
	WriteBatch,
	getFirestore,
} from "firebase-admin/firestore";

import _ from "lodash";
import hash from "string-hash";

async function batchCreateAll(
	highlights: ParsedHighlightWithHash[],
	volume: DocumentReference,
) {
	const db = getFirestore();
	const batch = db.batch();
	highlights.forEach((highlight) => batchCreate(highlight, volume, batch));
	const results = await batch.commit();
	if (results.length) {
		console.log(`Created ${results.length} highlights`);
	}
}

function batchCreate(
	highlight: ParsedHighlightWithHash,
	volume: DocumentReference,
	batch: WriteBatch,
) {
	const db = getFirestore();
	const ref = db.collection("highlights").doc();

	// Pull out the properties we know will be present,
	// then pass the rest of the object into Object.assign
	// so we can capture all other props that might be present
	const content = highlight.content;
	delete highlight.content;

	const data = Object.assign(
		{
			body: content,
			createdAt: Timestamp.now(),
			visible: true,
			volume: volume,
		},
		highlight,
	);

	return batch.create(ref, data);
}

function filterExisting(
	newHighlights: ParsedHighlightWithHash[],
	existingHighlights: QueryDocumentSnapshot<DocumentData>[],
) {
	const hashes = existingHighlights.map((highlight) => highlight.get("hash"));

	newHighlights = _.reject(newHighlights, (highlight) =>
		_.includes(hashes, highlight.hash),
	);

	return newHighlights;
}

/**
 * Create highlights (after filtering any that already exists)
 * @param allHighlights - Identified in email
 */
export async function importHighlights(
	allHighlights: ParsedHighlight[],
	volume: DocumentReference,
) {
	const db = getFirestore();

	// Add the hash so we can compare against existing hash, and
	// save to the DB if this highlight doesn't exist
	const allHighlightsWithHashes: ParsedHighlightWithHash[] = allHighlights.map(
		(highlight) => {
			return { ...highlight, hash: hash(highlight.content) };
		},
	);

	const snapshot = await db
		.collection("highlights")
		.where("volume", "==", volume)
		.select("hash")
		.get();

	const highlightsToImport = snapshot.empty
		? allHighlightsWithHashes
		: filterExisting(allHighlightsWithHashes, snapshot.docs);

	if (!highlightsToImport.length) {
		console.log("No new highlights.");
		return Promise.reject(new Error("No new highlights."));
	}

	return batchCreateAll(highlightsToImport, volume);
}
