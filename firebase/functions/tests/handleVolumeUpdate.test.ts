import crypto from "crypto";

import { getFirestore } from "firebase-admin/firestore";

import * as functions from "../src/index";
import tester from "./_tester";

it("updates highlights to match visibility", async () => {
	const db = getFirestore();

	const volumePath = `volumes/${crypto.randomUUID()}`;
	const volumeRef = db.doc(volumePath);

	const beforeSnap = tester.firestore.makeDocumentSnapshot(
		{ visible: true },
		volumePath,
	);
	const afterSnap = tester.firestore.makeDocumentSnapshot(
		{ visible: false },
		volumePath,
	);

	const highlight = { visible: true, volume: volumeRef };
	const highlightRef = db.doc(`highlights/${crypto.randomUUID()}`);
	await highlightRef.set(highlight);

	const change = tester.makeChange(beforeSnap, afterSnap);
	const triggerFunction = tester.wrap(functions.VolumeUpdate);
	await triggerFunction(change);

	const doc = await highlightRef.get();
	const updatedData = doc.data();

	expect(updatedData?.visible).toBe(false);
});
