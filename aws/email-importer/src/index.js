const AWS = require("aws-sdk");
const importMail = require("./importMail");
const { initializeApp, cert } = require("firebase-admin/app");
const s3 = new AWS.S3();

/**
 * Lambda handler fired when a new S3 file has been created.
 * This file is expected to be an email message conforming
 * to one of the supported highlight exports (Kindle or
 * or plain text).
 * @param {Object} event - SES event
 * @param {Array<Object>} event.Records
 * @param {Object} context
 */
exports.handler = function (event, context) {
	console.log("Received event", event);
	const params = s3Params(event);

	initializeApp({
		credential: cert(JSON.parse(process.env.SERVICE_ACCOUNT)),
	});

	s3.getObject(params, (err, data) => {
		if (err) throw err;

		importMail(data.Body)
			.then(() => context.succeed(`Successfully imported ${params.Key}`))
			.catch((err) => {
				console.error(err);
				context.fail(`Failed to import ${params.Key}`);
			});
	});
};

/**
 * Form the request object for getObject
 * @param {Object} event - SES Event
 * @returns {Object}
 */
function s3Params(event) {
	const bucket = process.env.S3_BUCKET;
	const prefix = process.env.KEY_PREFIX || "";
	const s3ObjectKey = event.Records[0].ses.mail.messageId;
	console.log("SES Message ID", s3ObjectKey);

	return { Bucket: bucket, Key: `${prefix}${s3ObjectKey}` };
}
