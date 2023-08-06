import { cert, getApps, initializeApp } from "firebase-admin/app";
import { S3Event } from "aws-lambda";

import { S3 } from "@aws-sdk/client-s3";

import { syncDb } from "./services/DbSyncer";
import { getHighlightsAndVolumeFromEmail } from "./services/Parser";

interface ImporterEvent extends S3Event {
	test?: boolean;
}

/**
 * Lambda handler fired when a new S3 file has been created.
 * This file is expected to be an email message conforming
 * to one of the supported highlight exports (Kindle or
 * or plain text).
 */
export async function handler(event: ImporterEvent) {
	const s3Record = event.Records[0];
	const s3 = new S3({
		region: s3Record.awsRegion,
	});

	// Check for existing app instance (for testing)
	if (!getApps().length) {
		initializeApp({
			credential: process.env.SERVICE_ACCOUNT
				? cert(JSON.parse(process.env.SERVICE_ACCOUNT))
				: undefined,
		});
	}

	const { Body } = await s3.getObject({
		Bucket: s3Record.s3.bucket.name,
		Key: s3Record.s3.object.key,
	});

	const { highlights, volume } = await getHighlightsAndVolumeFromEmail(Body);
	await syncDb(volume, highlights, {
		mockWrite: event.test,
	});
}
