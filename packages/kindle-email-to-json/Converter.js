const cheerio = require("cheerio");

/**
 * Convert email HTML into JSON
 * @param {String} html
 * @returns {Object}
 */
const Converter = function(html) {
  this.html = html;
  this.$ = cheerio.load(this.html);
};

/**
 * Determine whether the given HTML is a valid Kindle notes export
 * @returns {Boolean}
 */
Converter.prototype.valid = function() {
  if (this.html) {
    const notes = this.$(".noteText");
    return notes.length > 0;
  }

  return false;
};

/**
 * Parse the HTML to pull out the book's title, author, and highlights
 * @returns {Object}
 */
Converter.prototype.getJSON = function() {
  const titleEl = this.$(".bookTitle");
  const authorEl = this.$(".authors");
  const title = titleEl.text().trim();
  const authors = authorEl.text().trim();

  return {
    volume: {
      title: title,
      authors: authors
    },
    highlights: this.parseHighlights()
  };
};

Converter.prototype.parseHighlights = function($) {
  const locations = this.$(".noteHeading");
  let highlights = [];

  locations.each((index, el) => {
    const location = cheerio(el)
      .text()
      .trim();
    const locationMatch = location.match(/location\s(\d*)/i);

    if (locationMatch)
      highlights = highlights.concat(
        this.parseHighlightAfterElement(locationMatch[1], el)
      );
  });

  return highlights;
};

/**
 * Find the next highlight(s) after the given element
 * @param  {String} location - The highlight location
 * @param  {Node} el
 * @return {Array} The parsed highlight objects
 */
Converter.prototype.parseHighlightAfterElement = function(location, el) {
  let highlights = [];
  const nextEl = cheerio(el).next();

  if (nextEl.hasClass("noteText")) {
    const highlight = {
      content: cheerio(nextEl)
        .text()
        .trim(),
      location: location,
      source: "kindle"
    };

    highlights.push(highlight);

    if (nextEl.next().hasClass("noteText"))
      highlights = highlights.concat(
        this.parseHighlightAfterElement(location, nextEl)
      );
  }

  return highlights;
};

module.exports = Converter;
