import { getStorage } from "firebase-admin/storage";

import crypto from "crypto";

import * as functions from "../src/index";
import tester from "./_tester";

describe("when Volume is created", () => {
	const volume = {
		title: "The Overstory",
		authors: ["Richard Powers"],
	};
	const snap = tester.firestore.makeDocumentSnapshot(
		volume,
		`volumes/${crypto.randomUUID()}`,
	);

	it("sets additional fields based on the title and author(s)", async () => {
		const triggerFunction = tester.wrap(functions.VolumeCreate);
		await triggerFunction(snap);

		const doc = await snap.ref.get();
		const updatedData = doc.data();

		// New fields
		expect(updatedData.googleBook).toBeDefined();
		expect(updatedData.subtitle).toBe("A Novel");

		// Existing fields should not be overwritten
		expect(updatedData.title).toBe("The Overstory");
		expect(updatedData.authors).toEqual(["Richard Powers"]);
	});

	it("stores the cover image in the storage bucket", async () => {
		const triggerFunction = tester.wrap(functions.VolumeCreate);
		await triggerFunction(snap);

		const doc = await snap.ref.get();
		const updatedData = doc.data();

		const key = updatedData.image;
		const bucket = getStorage().bucket();
		const file = bucket.file(key);

		const [exists] = await file.exists();
		const metadata = await file.getMetadata();

		expect(exists).toBe(true);
		expect(parseInt(metadata[0].size)).toBeGreaterThan(0);
		expect(metadata[0].contentType).toBe("image/jpeg");
	});
});
