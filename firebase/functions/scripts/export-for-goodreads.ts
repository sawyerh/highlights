/**
 * @file Creates a CSV of Volumes for import into Goodreads.
 *
 * To use this script, from the functions/ directory, run:
 *
 * export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
 * npx ts-node --cwdMode scripts/export-for-goodreads.ts
 */
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import volumeConverter from "../src/volume/converter";

initializeApp({
	storageBucket: "unused but required",
});
const db = getFirestore();

async function getVolumes() {
	const snapshot = await db
		.collection("volumes")
		.withConverter(volumeConverter)
		.where("visible", "==", true)
		.get();

	return snapshot.docs;
}

function getIsbn(volume: Volume) {
	const identifiers = volume.industryIdentifiers || [];

	if (identifiers.length === 0) {
		return "";
	}

	return identifiers[identifiers.length - 1].identifier;
}

getVolumes().then((docs) => {
	let csv = `Title, Author, ISBN, Date Read, Date Added`;

	docs.forEach((doc) => {
		const volume = doc.data();
		const isbn = getIsbn(volume);

		if (!isbn) return;
		const author = volume.authors?.[0] || "";

		csv += `\n${volume.title}, ${author}, ${isbn}, ${volume.createdAt}, ${volume.createdAt}`;
	});

	console.log(csv);
});
