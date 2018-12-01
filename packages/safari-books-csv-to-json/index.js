const Converter = require("./Converter");
const parseMail = require("mailparser").simpleParser;

/**
 * Convert a Safari Books CSV highlights export into a JSON object.
 * Rejects if the source isn't a valid Safari Books CSV export. The email is
 * expected to contain at least one CSV attachment.
 * @param {Buffer|Stream|String} source
 * @returns {Promise<Object>}
 */
async function toJSON(source) {
  const mail = await parseMail(source);
  const contents = await attachment(mail);
  return convert(contents);
}

/**
 * @param {String} contents - CSV attachment content
 * @returns {Promise<Object>}
 */
async function convert(contents) {
  const converter = new Converter(contents);
  const valid = await converter.valid();

  if (valid) {
    return converter.getJSON();
  }

  return new Error(
    "Invalid mail content. Expected an CSV attachment with Safari Books highlights."
  );
}

/**
 * Get the first CSV attachment from the email
 * @param {Object} mail
 * @param {Array} mail.attachments
 * @returns {String} Attachment's content
 */
function attachment(mail) {
  if (mail.attachments) {
    const attachments = mail.attachments.filter(
      attachment => attachment.contentType === "text/csv"
    );

    if (attachments.length) return attachments[0].content.toString("utf8");
  }

  return new Error("No valid CSV attachment");
}

module.exports = toJSON;
