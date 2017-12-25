const AWS = require("aws-sdk");
const importMail = require("./importer");
const s3 = new AWS.S3();

/**
 * Lambda handler fired when a new S3 file has been created.
 * This file is expected to be an email message conforming
 * to one of the supported highlight exports (Kindle or
 * or plain text).
 * @param {Object} event
 * @param {Array<Object>} event.Records
 * @param {Object} context
 * @param {Boolean} debug - Disable saving the highlights to Siteleaf/Firebase
 */
exports.handler = function(event, context, debug = false) {
  console.log("Received event", event);
  const params = s3Params(event);

  s3.getObject(params, (err, data) => {
    if (err) {
      console.log(err);
      return context.fail(
        `Error getting object ${params.Key} from bucket ${params.Bucket}`
      );
    }

    importMail(data.Body, debug)
      .then(() => context.succeed(`Successfully imported ${params.Key}`))
      .catch(context.fail);
  });
};

/**
 * Form the request object for getObject
 * @param {Object} event - Lambda Event
 * @returns {Object}
 */
function s3Params(event) {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );
  return { Bucket: bucket, Key: key };
}
