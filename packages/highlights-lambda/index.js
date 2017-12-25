const aws = require("aws-sdk");
const MailParser = require("mailparser").MailParser;
const parseMail = require("./parsers/parser");
const s3 = new aws.S3({ apiVersion: "2006-03-01" });

exports.handler = function(event, context, debug = false) {
  console.log("Received event", event);

  // Get the object from the event and show its content type
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );
  const params = { Bucket: bucket, Key: key };
  const mailparser = new MailParser();

  mailparser.on("end", function(mail) {
    parseMail(mail)
      .then(function() {
        context.succeed("Parsed mail");
      })
      .catch(function(message) {
        context.fail(message);
      });
  });

  console.log("Handling %s", key);

  try {
    s3
      .getObject(params, function(err, data) {
        if (err) {
          console.log(err);
          const message =
            "Error getting object " +
            key +
            " from bucket " +
            bucket +
            ". Make sure they exist and your bucket is in the same region as this function.";
          console.log(message);
          context.fail(message);
        }
      })
      .on("httpData", function(chunk) {
        mailparser.write(chunk);
      })
      .on("httpDone", function() {
        mailparser.end();
      });
  } catch (e) {
    console.log("Caught Error:");
    context.fail(e.message);
  }
};
