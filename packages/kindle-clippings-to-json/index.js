const Converter = require("./Converter");
const parseMail = require("mailparser").simpleParser;

/**
 * Convert a Kindle clippings email body into a JSON object. Rejects
 * if the mail isn't a valid Kindle clippings export.
 * @param {Buffer|Stream|String} source
 * @returns {Promise<Object>}
 */
function toJSON(source) {
  return parseMail(source).then(convert);
}

/**
 * @param {Object} mail - simpleParser response
 * @param {String} mail.text - plaintext body of the message
 */
function convert(mail) {
  const converter = new Converter(mail.text);
  if (converter.valid) return converter.getJSON();

  return new Error(
    "Invalid mail content. Expected an plain text body with Kindle clippings."
  );
}

module.exports = toJSON;
