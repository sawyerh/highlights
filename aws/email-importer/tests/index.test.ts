import { getFirestore } from "firebase-admin/firestore";

import AWS from "aws-sdk";
import fs from "fs/promises";
import path from "path";

import { handler } from "../src/index";

jest.mock("aws-sdk");

const MOCK_EVENT = {
	Records: [
		{
			ses: {
				mail: {
					messageId: "email.txt",
				},
			},
		},
	],
};

describe("handler", () => {
	beforeEach(async () => {
		const email = await fs.readFile(
			path.resolve(__dirname, "./fixtures/email.txt"),
			"utf8",
		);

		const mockS3 = {
			getObject: jest.fn().mockReturnValue({
				promise: jest.fn().mockResolvedValue({
					Body: email,
				}),
			}),
		};

		// @ts-expect-error: mocked
		AWS.S3.mockReturnValue(mockS3);
	});

	it("fetches the object from the correct bucket and directory", async () => {
		process.env.KEY_PREFIX = "inbox/";

		await handler(MOCK_EVENT);

		expect(new AWS.S3().getObject).toHaveBeenCalledWith({
			Bucket: "test",
			// process.env.KEY_PREFIX + MOCK_EVENT.Records[0].ses.mail.messageId
			Key: "inbox/email.txt",
		});
	});

	it("creates a Volume and Highlights", async () => {
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
		await handler(MOCK_EVENT);
		await handler(MOCK_EVENT);

		const db = getFirestore();
		const volumes = await db.collection("volumes").get();
		const highlights = await db.collection("highlights").get();

		expect(volumes.size).toBe(1);
		expect(highlights.size).toBe(14);
	});

	it("doesn't create records if the event has the test property set to true", async () => {
		await handler({ ...MOCK_EVENT, test: true });

		const db = getFirestore();
		const volumes = await db.collection("volumes").get();
		const highlights = await db.collection("highlights").get();

		expect(volumes.empty).toBe(true);
		expect(highlights.empty).toBe(true);
	});
});
