const Converter = require("./Converter");
const parseMail = require("mailparser").simpleParser;

/**
 * Convert a Kindle notes email export into a JSON object. Rejects
 * if the mail isn't a valid Kindle notes export. The email is
 * expected to contain at least one HTML attachment.
 * @param {import("mailparser").Source} source
 * @returns {Promise<Object>}
 */
function toJSON(source) {
	return parseMail(source).then(attachment).then(convert);
}

/**
 * @param {String} contents - HTML attachment content
 * @returns {Object}
 */
function convert(contents) {
	const converter = new Converter(contents);

	if (converter.valid) {
		return converter.getJSON();
	}

	throw new Error("Email not in compatible format for parsing");
}

/**
 * Get the first HTML attachment from the email
 * @param {Object} mail
 * @param {Array} mail.attachments
 * @returns {String} Attachment's content
 */
function attachment(mail) {
	if (mail.attachments) {
		const attachments = mail.attachments.filter(
			(attachment) => attachment.contentType === "text/html",
		);

		if (attachments.length) return attachments[0].content.toString("utf8");
	}

	throw new Error("Kindle HTML attachment not found");
}

module.exports = toJSON;
