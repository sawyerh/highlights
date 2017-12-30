const frontmatter = require("front-matter");
const parseMail = require("mailparser").simpleParser;

/**
 * Convert a notes email export into a JSON object. Rejects
 * if the mail isn't a valid notes export.
 * @param {Buffer|Stream|String} source
 * @returns {Promise<Object>}
 */
function toJSON(source) {
  return parseMail(source).then(convert);
}

/**
 * @param {Object} mail
 */
function convert(mail) {
  if (valid(mail.text)) {
    return Promise.resolve(getJSON(mail));
  }

  return Promise.reject(
    new Error(
      "Invalid mail content. Expected plain text body with YAML front-matter."
    )
  );
}

/**
 * @param {String} text
 */
function valid(text) {
  return text && frontmatter.test(text.trim());
}

/**
 * @param {Object} mail
 * @param {String} mail.text
 * @returns {Object}
 */
function getJSON(mail) {
  const data = frontmatter(mail.text.trim());
  const blocks = data.body.split("\n\n\n");
  let authors = data.attributes.authors;

  if (typeof authors === "string") {
    authors = authors.split(";").map(s => s.trim());
  }

  return {
    volume: { title: data.attributes.title, authors: authors },
    highlights: parseHighlights(blocks)
  };
}

/**
 * Convert the array of notes into a JSON object
 * @param {Array<String>} textBlocks
 * @returns {Array<Object>}
 */
function parseHighlights(textBlocks) {
  return textBlocks
    .map(text => text.trim())
    .filter(text => text !== "")
    .map(text => ({ content: text }));
}

module.exports = toJSON;
