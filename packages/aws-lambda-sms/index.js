const AWS = require("aws-sdk");
const request = require("request-promise");
const sns = new AWS.SNS();

exports.handler = (event, context, callback) => {
  request("https://highlights.sawyerh.com/api/highlights/random")
    .then(res => {
      const highlight = JSON.parse(res);
      if (!highlight) return context.fail("No highlight received");

      const body = highlight.body.replace("\n", "");
      const location = highlight.location ? `, ${highlight.location}` : "";
      const params = {
        Message: `${body} [${highlight.volume.title}${location}]`,
        TopicArn: process.env.SNS_TOPIC_ARN
      };

      console.log(`Sending ${highlight.id} via SMS`);
      return sns.publish(params).promise();
    })
    .then(context.succeed)
    .catch(context.fail);
};
