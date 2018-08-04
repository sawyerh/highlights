const Clipper = require("./kindle-my-clippings");

/**
 * Convert email body with clippings into JSON
 * @param {String} text - plaintext body of the email
 * @returns {Object}
 */
const Converter = function(text) {
  this.text = text;
};

/**
 * Determine whether the given email body includes valid Kindle clippings
 * @returns {Boolean}
 */
Converter.prototype.valid = function() {
  return this.text && this.text.match(/==========/);
};

/**
 * Parse the text to pull out the volume's title, author, and highlights
 * @returns {Object}
 */
Converter.prototype.getJSON = function() {
  const clipper = new Clipper();
  const clippings = clipper.getParsed(this.text);

  if (!clippings.length) return;

  const title = clippings[0].title;
  const authors = [clippings[0].author];

  return {
    volume: {
      title: title,
      authors: authors
    },
    highlights: this.highlights(clippings)
  };
};

/**
 * Parse the clippings
 * @param {Array} clippings
 * @param {Array} higlights
 */
Converter.prototype.highlights = function(clippings) {
  return clippings.map(clipping => ({
    content: clipping.text,
    location: clipping.location
  }));
};

module.exports = Converter;
