const Twilio = require("twilio");
const request = require("request-promise");

exports.handler = async (event, context) => {
  try {
    const res = await request(
      "https://highlights.sawyerh.com/api/highlights/random"
    );
    const highlight = JSON.parse(res);
    if (!highlight) return context.fail("No highlight received");

    console.log(`Sending ${highlight.id} via SMS`);

    await send(`${highlight.body} http://🔖.to/highlights/${highlight.id}`);
    return context.succeed();
  } catch (e) {
    return context.fail(e);
  }
};

function send(message) {
  const client = new Twilio(process.env.SID, process.env.TOKEN); // twilio.com/console

  return client.messages
    .create({
      body: message,
      to: process.env.TO,
      from: process.env.FROM
    })
    .then(sms => console.log(`Sent SMS`, sms.sid));
}
