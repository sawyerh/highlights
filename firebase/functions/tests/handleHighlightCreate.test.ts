import { getFirestore } from "firebase-admin/firestore";

import crypto from "crypto";

import * as functions from "../src/index";
import tester from "./_tester";

it("runs language analysis", async () => {
	const highlight = {
		body: "Pinatubo was the name of a volcano in the Philippines that had exploded in 1991. \
      It had blasted fifteen million tons of sulfur dioxide into the stratosphere. \
      The result had been a couple of years’ beautiful sunsets and reduced global temperatures. \
      The two phenomena were directly related. The sulfur from the volcano had eventually spread \
      out into a veil of tiny droplets of H2SO4.",
	};

	const db = getFirestore();
	const highlightPath = `highlights/${crypto.randomUUID()}`;
	const ref = db.doc(highlightPath);
	await ref.set(highlight);
	const snap = tester.firestore.makeDocumentSnapshot(highlight, highlightPath);

	const triggerFunction = tester.wrap(functions.HighlightCreate);
	await triggerFunction(snap);
	const doc = await snap.ref.get();
	const updatedData = doc.data();

	// New fields
	expect(updatedData.languageAnalysis).toBeDefined();
	const entity = updatedData.languageAnalysis.entities.find(
		(entity: { [key: string]: string }) => entity.name === "Philippines",
	);
	expect(entity.metadata).toEqual({
		mid: "/m/05v8c",
		wikipedia_url: "https://en.wikipedia.org/wiki/Philippines",
	});

	// Existing fields should not be overwritten
	expect(updatedData.body).toBe(highlight.body);
});
