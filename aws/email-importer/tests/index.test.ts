import fs from "fs";
import path from "path";

import { getFirestore } from "firebase-admin/firestore";
import { S3Event } from "aws-lambda";

import { S3 } from "@aws-sdk/client-s3";

import { handler } from "../src/index";

const EMAIL_FIXTURE = fs.readFileSync(
	path.resolve(__dirname, "./fixtures/email.txt"),
	"utf8",
);

const MOCK_EVENT = {
	Records: [
		{
			awsRegion: "us-east-1",
			s3: {
				bucket: {
					name: "highlights.sawyerh.com",
				},
				object: {
					key: "inbox/rl9cu2j5ekkh5086o72hahr86b9mi43kp7n7ogg1",
				},
			},
		},
	],
} as S3Event;

function mockGetObject() {
	// @ts-expect-error - mock
	return jest.spyOn(S3.prototype, "getObject").mockResolvedValue({
		Body: Buffer.from(EMAIL_FIXTURE),
	});
}

describe("handler", () => {
	it("fetches the object from the correct bucket and directory", async () => {
		const spy = mockGetObject();

		await handler(MOCK_EVENT);

		expect(spy).toHaveBeenCalledWith({
			Bucket: MOCK_EVENT.Records[0].s3.bucket.name,
			Key: MOCK_EVENT.Records[0].s3.object.key,
		});
	});

	it("creates a Volume and Highlights", async () => {
		mockGetObject();

		await handler(MOCK_EVENT);

		const db = getFirestore();
		const volumes = await db.collection("volumes").get();
		const highlights = await db.collection("highlights").get();

		expect(volumes.size).toBe(1);
		expect(highlights.size).toBe(14);

		const volume = volumes.docs[0].data();
		expect(volume.importTitle).toBe(
			"Machine, Platform, Crowd: Harnessing Our Digital Future",
		);
	});

	it("does not import a duplicate Volume or Highlights", async () => {
		mockGetObject();

		await handler(MOCK_EVENT);
		await handler(MOCK_EVENT);

		const db = getFirestore();
		const volumes = await db.collection("volumes").get();
		const highlights = await db.collection("highlights").get();

		expect(volumes.size).toBe(1);
		expect(highlights.size).toBe(14);
	});

	it("doesn't create records if the event has the test property set to true", async () => {
		mockGetObject();
		await handler({ ...MOCK_EVENT, test: true });

		const db = getFirestore();
		const volumes = await db.collection("volumes").get();
		const highlights = await db.collection("highlights").get();

		expect(volumes.empty).toBe(true);
		expect(highlights.empty).toBe(true);
	});
});
