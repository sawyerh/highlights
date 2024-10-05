/**
 * @file Creates a Markdown file for each Volume, with the highlights as its body.
 *
 * To use this script, from the functions/ directory, run:
 *
 * export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
 * npx ts-node --cwdMode scripts/export-markdown.ts
 */
import fs from "fs";
import path from "path";

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import highlightConverter from "../src/highlight/converter";
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

async function createMd(volume: Volume, highlights: Highlight[]) {
	const author = volume.authors?.[0] || "";
	const isbn = getIsbn(volume);

	console.log(`Found ${highlights.length} highlights for ${volume.title}`);

	const title = [volume.title, volume.subtitle].filter(Boolean).join(": ");
	let md = `# ${title}\n\n`;

	if (author) md += `**Author**: ${author}\n\n`;
	if (isbn) md += `**ISBN**: ${isbn}\n\n`;

	md += `## Highlights\n\n`;

	highlights.forEach((highlight) => {
		md += `${highlight.body}\n\n`;
	});

	await fs.promises.writeFile(path.join(__dirname, `tmp/${volume.id}.md`), md);
}

async function run() {
	try {
		await fs.promises.mkdir(path.join(__dirname, "tmp"));
	} catch (err) {
		// directory already exists
	}

	const docs = await getVolumes();
	await Promise.all(
		docs.map(async (doc) => {
			const volume = doc.data();
			const highlights = await db
				.collection("highlights")
				.withConverter(highlightConverter)
				.where("volume", "==", doc.ref)
				.get();

			// if (highlights.empty) return;

			await createMd(
				volume,
				highlights.docs.map((doc) => doc.data()),
			);
		}),
	);
}

run().then(() => {
	console.log(`Markdown files created in ${path.join(__dirname, "tmp")}`);
});
