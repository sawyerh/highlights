import { cert, getApps, initializeApp } from "firebase-admin/app";

import AWS from "aws-sdk";

import importMail from "./importMail";

interface SESEvent {
	test?: boolean;
	Records: Array<{
		ses: {
			mail: {
				messageId: string;
			};
		};
	}>;
}

/**
 * Lambda handler fired when a new S3 file has been created.
 * This file is expected to be an email message conforming
 * to one of the supported highlight exports (Kindle or
 * or plain text).
 */
export async function handler(event: SESEvent) {
	const s3 = new AWS.S3();
	const params = s3Params(event);

	// Check for existing app instance (for testing)
	if (!getApps().length) {
		initializeApp({
			credential: process.env.SERVICE_ACCOUNT
				? cert(JSON.parse(process.env.SERVICE_ACCOUNT))
				: undefined,
		});
	}

	const data = await s3.getObject(params).promise();

	if (event.test) {
		console.log("Exiting early for test event. Skipping import.");
		return;
	}

	await importMail(data.Body);
}

/**
 * Form the request object for getObject
 */
function s3Params(event: SESEvent): AWS.S3.GetObjectRequest {
	const bucket = process.env.S3_BUCKET ?? "";
	const prefix = process.env.KEY_PREFIX ?? "";
	const s3ObjectKey = event.Records[0].ses.mail.messageId;
	console.log("SES Message ID", s3ObjectKey);

	return { Bucket: bucket, Key: `${prefix}${s3ObjectKey}` };
}
