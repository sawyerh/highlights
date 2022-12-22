import { initializeApp } from "firebase-admin/app";
import {
	DocumentReference,
	Timestamp,
	getFirestore,
} from "firebase-admin/firestore";

import request from "supertest";

import api from "../src/api";

initializeApp();

describe("GET /volumes", () => {
	const TOTAL_VOLUMES = 25;

	/**
	 * Seed DB with volumes
	 */
	beforeEach(async () => {
		const db = getFirestore();
		const volumes: DocumentReference[] = [];

		for (let i = 1; i <= TOTAL_VOLUMES; i++) {
			volumes.push(db.collection("volumes").doc(i.toString()));
		}

		await Promise.all(
			volumes.map((volume) => {
				return volume.create({
					subtitle: `Volume ${volume.id}`,
					createdAt: Timestamp.fromMillis(parseInt(volume.id)),
					visible: true,
				});
			}),
		);
	});

	it("returns list of volumes from newest to oldest", async () => {
		const response = await request(api).get("/volumes");

		expect(response.status).toBe(200);
		expect(response.body.data.length).toBe(TOTAL_VOLUMES);
		expect(response.body.data[0].subtitle).toBe(`Volume ${TOTAL_VOLUMES}`);
		expect(response.body.data[TOTAL_VOLUMES - 1].subtitle).toBe(`Volume 1`);
	});

	it.skip("loads next page of volumes", async () => {
		const response = await request(api).get("/volumes").query({
			startAfter: "6",
		});

		expect(response.body.data.length).toBe(5);
		expect(response.body.data[0].subtitle).toBe("Volume 5");
	});

	it("returns empty list when there are no more volumes", async () => {
		const response = await request(api).get("/volumes").query({
			startAfter: "1",
		});

		expect(response.body.data.length).toBe(0);
		expect(response.body.startAfter).toBe(null);
	});

	it("excludes Volumes set to hidden", async () => {
		const db = getFirestore();

		const response_1 = await request(api).get("/volumes");
		const volumeId = response_1.body.data[0].id;

		const volume = db.collection("volumes").doc(volumeId);
		await volume.update({ visible: false });

		const response = await request(api).get("/volumes");

		expect(response.body.data[0].id).not.toEqual(volumeId);
	});
});

describe("GET /volumes/:volumeId", () => {
	it("returns volume by ID", async () => {
		const db = getFirestore();
		const volume = await db.collection("volumes").add({
			subtitle: "Volume 1",
		});

		const response = await request(api).get(`/volumes/${volume.id}`);

		expect(response.status).toBe(200);
		expect(response.body.subtitle).toBe("Volume 1");
	});

	it("returns 404 when volume does not exist", async () => {
		const response = await request(api).get("/volumes/1");

		expect(response.status).toBe(404);
	});
});

describe("GET /highlights", () => {
	it("returns list of highlights by volume", async () => {
		const db = getFirestore();
		const volume = await db.collection("volumes").add({});

		await Promise.all(
			Array.from({ length: 5 }).map((_, index) => {
				return db.collection("highlights").add({
					location: index,
					visible: true,
					volume: volume,
				});
			}),
		);

		// Add a highlight that is not visible
		await db.collection("highlights").add({
			visible: false,
			volume: volume,
		});

		// A highlight unrelated to the targeted volume
		await db.collection("highlights").add({
			visible: true,
		});

		const response = await request(api).get("/highlights").query({
			volume: volume.id,
		});

		expect(response.status).toBe(200);
		expect(response.body.data.length).toBe(5);
	});

	it("returns empty list when there are no highlights", async () => {
		const response = await request(api).get("/highlights").query({
			volume: "1",
		});

		expect(response.status).toBe(200);
		expect(response.body.data.length).toBe(0);
	});

	it.each([
		{
			createOrder: ["100", "1", "10", "4", "5"],
			expectedOrder: ["1", "4", "5", "10", "100"],
		},
		{
			createOrder: [100, 1, 10, 4, 5, 0],
			expectedOrder: [0, 1, 4, 5, 10, 100],
		},
		{
			createOrder: ["300-400", "100-200", "1-2", "200-300"],
			expectedOrder: ["1-2", "100-200", "200-300", "300-400"],
		},
		{
			createOrder: ["d", "a", "c", "b"],
			expectedOrder: ["a", "b", "c", "d"],
		},
	])("sorts by locations", async ({ createOrder, expectedOrder }) => {
		const db = getFirestore();
		const volume = await db.collection("volumes").add({});

		// Even though they're strings, they should get sorted numerically
		await Promise.all(
			createOrder.map((location) => {
				return db.collection("highlights").add({
					location: location,
					visible: true,
					volume: volume,
				});
			}),
		);

		const response = await request(api).get("/highlights").query({
			volume: volume.id,
		});

		expect(response.body.data.map((d: Highlight) => d.location)).toEqual(
			expectedOrder,
		);
	});
});

describe("GET /highlights/:highlightId", () => {
	it("returns highlight by ID", async () => {
		const db = getFirestore();
		const volume = await db.collection("volumes").add({});
		const highlight = await db.collection("highlights").add({
			location: "1",
			volume: volume,
		});

		const response = await request(api).get(`/highlights/${highlight.id}`);

		expect(response.status).toBe(200);
		expect(response.body.volume).toBe(volume.id);
	});

	it("returns 404 when highlight does not exist", async () => {
		const response = await request(api).get("/highlights/1");

		expect(response.status).toBe(404);
	});
});
