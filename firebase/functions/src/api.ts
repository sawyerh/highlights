import { getFirestore } from "firebase-admin/firestore";

import cors from "cors";
import express from "express";

import highlightConverter from "./highlight/converter";
import sortByLocation from "./highlight/sortByLocation";
import volumeConverter from "./volume/converter";

const app = express();

// Allow cross-origin requests
app.use(cors({ origin: true }));

// Cache all responses for 10 minutes
// https://firebase.google.com/docs/hosting/manage-cache
app.use(
	(req: express.Request, res: express.Response, next: express.NextFunction) => {
		res.set("Cache-Control", "public, max-age=600");
		next();
	},
);

app.get("/volumes", async (req: express.Request, res: express.Response) => {
	const startAfter =
		typeof req.query.startAfter === "string" ? req.query.startAfter : null;
	const db = getFirestore();
	let query = db
		.collection("volumes")
		.withConverter(volumeConverter)
		.where("visible", "==", true)
		.orderBy("createdAt", "desc");
	// TODO: Pagination
	// .limit(20);

	if (startAfter) {
		const startAfterSnap = await db.collection("volumes").doc(startAfter).get();
		query = query.startAfter(startAfterSnap);
	}

	const querySnapshot = await query.get();
	const volumes = querySnapshot.docs.map((doc) => {
		return { ...doc.data(), id: doc.id };
	});

	return res.send({
		startAfter: volumes.length ? volumes[volumes.length - 1].id : null,
		data: volumes,
	});
});

app.get("/volumes/:id", async (req: express.Request, res: express.Response) => {
	const db = getFirestore();
	const volumeSnap = await db
		.collection("volumes")
		.withConverter(volumeConverter)
		.doc(req.params.id)
		.get();

	if (!volumeSnap.exists) return res.status(404).send();

	return res.send(volumeSnap.data());
});

/**
 * @param req.query.volume - Volume ID to find highlights by
 */
app.get("/highlights", async (req: express.Request, res: express.Response) => {
	const volume = req.query.volume;
	if (typeof volume !== "string")
		return res.status(400).send("Volume ID is required");

	const db = getFirestore();
	const volumeRef = db.collection("volumes").doc(volume);

	const highlightSnaps = await db
		.collection("highlights")
		.withConverter(highlightConverter)
		.where("visible", "==", true)
		.where("volume", "==", volumeRef)
		.limit(200) // arbitrarily large limit that should be enough, while guarding against unexpected behavior
		.get();

	const highlights = highlightSnaps.docs
		.map((doc) => doc.data())
		.sort(sortByLocation);

	return res
		.set("Cache-Control", "public, max-age=3600") // 1hr. Highlights are less likely to change after the import
		.send({ data: highlights });
});

app.get(
	"/highlights/:id",
	async (req: express.Request, res: express.Response) => {
		const db = getFirestore();
		const highlightSnap = await db
			.collection("highlights")
			.withConverter(highlightConverter)
			.doc(req.params.id)
			.get();

		if (!highlightSnap.exists) return res.status(404).send();

		return res
			.set("Cache-Control", "public, max-age=3600") // 1hr. Highlights are less likely to change after the import
			.send(highlightSnap.data());
	},
);

export default app;
