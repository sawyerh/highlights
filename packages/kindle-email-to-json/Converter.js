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
 * Parse the HTML to pull out the volume's title, author, and highlights
 * @returns {Object}
 */
Converter.prototype.getJSON = function() {
  const titleEl = this.$(".bookTitle");
  const authorEl = this.$(".authors");
  const title = titleEl.text().trim();
  const authors = authorEl
    .text()
    .split(";")
    .map(s => s.trim());

  return {
    volume: {
      title: title,
      authors: authors
    },
    highlights: this.highlights()
  };
};

/**
 * Parse the highlights and notes from the HTML
 * @returns {Array} highlights
 */
Converter.prototype.highlights = function() {
  const headings = this.$(".noteHeading");
  let highlights = [];

  headings.each((index, el) => {
    const heading = cheerio(el)
      .text()
      .trim();

    const location = heading.match(/location\s(\d*)/i);

    if (location) {
      if (heading.match(/^Note -/i)) {
        // We're making the assumption that notes are only added on top of
        // a highlight. When that's the case, the exported file will include
        // the note directly after the text it's added on.
        if (highlights.length) {
          const highlight = highlights[highlights.length - 1];
          highlight.notes = this.parseTextAfterElement(location[1], el);
        }
      } else {
        highlights = highlights.concat(
          this.parseTextAfterElement(location[1], el)
        );
      }
    }
  });

  return highlights;
};

/**
 * Find the next note text after the given element
 * @param  {String} location - The highlight location
 * @param  {Node} el
 * @return {Array} The parsed highlight objects
 */
Converter.prototype.parseTextAfterElement = function(location, el) {
  let highlights = [];
  const nextEl = cheerio(el).next();

  if (nextEl.hasClass("noteText")) {
    const highlight = {
      content: cheerio(nextEl)
        .text()
        .trim(),
      location: location
    };

    highlights.push(highlight);

    if (nextEl.next().hasClass("noteText"))
      highlights = highlights.concat(
        this.parseTextAfterElement(location, nextEl)
      );
  }

  return highlights;
};

module.exports = Converter;
