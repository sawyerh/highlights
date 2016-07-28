"use strict";

var cheerio = require('cheerio');

var Parser = function(html) {
  this.html = html;
};

Parser.prototype.parseable = function () {
  if(this.html){
    var $ = cheerio.load(this.html);
    var notes = $('.noteText');
    return notes.length > 0;
  }
};

Parser.prototype.parse = function () {
  var $ = cheerio.load(this.html);
  var titleEl = $('.bookTitle');
  var authorEl = $('.authors');
  var title = titleEl.text().trim();
  var author = authorEl.text().trim();

  return {
    book: {
      title: title,
      author: author
    },
    highlights: this.parseHighlights($)
  };
};

Parser.prototype.parseHighlights = function ($) {
  var locations = $('.noteHeading');
  var highlights = [];

  locations.each((index, el) => {
    var location = cheerio(el).text().trim();
    var locationMatch = location.match(/location\s(\d*)/i);

    if (locationMatch)
      highlights = highlights.concat(this.parseHighlightAfterElement(locationMatch[1], el));
  });

  return highlights;
};

/**
 * Find the next highlight(s) after the given element
 * @param  {String} location - The highlight location
 * @param  {Node} el
 * @return {Array} The parsed highlight objects
 */
Parser.prototype.parseHighlightAfterElement = function (location, el) {
  var highlights = [];
  var nextEl = cheerio(el).next();

  if (nextEl.hasClass('noteText')) {
    var highlight = {
      content: cheerio(nextEl).text().trim(),
      location: location,
      source: 'kindle'
    };

    highlights.push(highlight);

    if (nextEl.next().hasClass('noteText'))
      highlights = highlights.concat(this.parseHighlightAfterElement(location, nextEl));
  }

  return highlights;
}

module.exports = Parser;
