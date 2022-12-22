const AWS = require("aws-sdk");
const importMail = require("./importMail");
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

	s3.getObject(params, (err, data) => {
		if (err) {
			console.error(err);

			return context.fail(
				`Error getting object ${params.Key} from bucket ${params.Bucket}`,
			);
		}

		importMail(data.Body)
			.then(() => context.succeed(`Successfully imported ${params.Key}`))
			.catch(context.fail);
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
	const sesNotification = event.Records[0].ses;
	const key = sesNotification.mail.messageId;
	console.log("SES Message ID", key);

	return { Bucket: bucket, Key: `${prefix}${key}` };
}
