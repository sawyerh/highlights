"use strict";

const cheerio = require("cheerio");

const Parser = function(html) {
  this.html = html;
};

Parser.prototype.parseable = function() {
  if (this.html) {
    const $ = cheerio.load(this.html);
    const notes = $(".noteText");
    return notes.length > 0;
  }
};

Parser.prototype.parse = function() {
  const $ = cheerio.load(this.html);
  const titleEl = $(".bookTitle");
  const authorEl = $(".authors");
  const title = titleEl.text().trim();
  const author = authorEl.text().trim();

  return {
    book: {
      title: title,
      author: author
    },
    highlights: this.parseHighlights($)
  };
};

Parser.prototype.parseHighlights = function($) {
  const locations = $(".noteHeading");
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
Parser.prototype.parseHighlightAfterElement = function(location, el) {
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

module.exports = Parser;
