import crypto from "crypto";

import {
	DocumentReference,
	getFirestore,
	Timestamp,
} from "firebase-admin/firestore";

import type { ParsedHighlight, ParsedVolume } from "./parsing";

/**
 * Create database records for any missing volume and highlights
 */
export async function syncDb(
	volume: ParsedVolume,
	highlights: ParsedHighlight[],
	{ mockWrite } = { mockWrite: false },
) {
	if (mockWrite) {
		// Just test the Firebase connection when mocking writes
		const collections = await getFirestore().listCollections();
		console.log(
			"Skipping writes. Firestore has these collections:",
			collections.map((c) => c.path),
		);
		return;
	}

	const volumeRef = await syncVolume(volume);
	const createdHighlights = await syncHighlights(highlights, volumeRef);

	return { createdHighlights, volumeRef };
}

async function syncVolume(volume: ParsedVolume) {
	console.log("Syncing volume", volume);
	const db = getFirestore();
	const existingVolumeSnap = await db
		.collection("volumes")
		.where("importTitle", "==", volume.title)
		.get();

	if (existingVolumeSnap.empty) {
		console.log("Creating new volume", volume);

		const volumeRef = await db.collection("volumes").add({
			authors: volume.authors,
			createdAt: Timestamp.now(),
			// Preserve the original title for future syncs,
			// since I might change the title in the database
			// if the imported version isn't quite right
			importTitle: volume.title,
			title: volume.title,
			visible: true,
		});

		console.log("Created new volume", volumeRef.id);
		return volumeRef;
	}

	const existingVolumeRef = existingVolumeSnap.docs[0].ref;
	console.log("Found existing volume", existingVolumeRef.id);
	return existingVolumeRef;
}

async function syncHighlights(
	highlights: ParsedHighlight[],
	volume: DocumentReference,
) {
	const db = volume.firestore;
	const batch = db.batch();

	// Add a hash so we can use it to compare against existing highlights,
	// in case I edited the original highlight content.
	const hashedHighlights = highlights.map((highlight) => {
		return {
			...highlight,
			hash: crypto.createHash("md5").update(highlight.content).digest("hex"),
		};
	});

	const existingHighlightsSnap = await db
		.collection("highlights")
		.where("volume", "==", volume)
		.select("hash")
		.get();

	const existingHashes = existingHighlightsSnap.docs.map((highlight) =>
		highlight.get("hash"),
	);

	const newHighlights = hashedHighlights.filter(
		(highlight) => !existingHashes.includes(highlight.hash),
	);
	const createdHighlights: Highlight[] = [];

	newHighlights.forEach((highlight) => {
		const ref = db.collection("highlights").doc();
		// Pull out the properties we know will be present,
		// then pass the rest of the object into Object.assign
		// so we can capture all other props that might be present
		const { content, ...rest } = highlight;
		const data = {
			...rest,
			body: content,
			createdAt: Timestamp.now(),
			visible: true,
			volume,
		};

		createdHighlights.push({ ...data, id: ref.id, volume: volume.id });
		return batch.create(ref, data);
	});

	await batch.commit();

	if (createdHighlights.length) {
		console.log(`Created ${createdHighlights.length} highlights`, {
			ids: createdHighlights.map((h) => h.id),
		});
	}

	return createdHighlights;
}
