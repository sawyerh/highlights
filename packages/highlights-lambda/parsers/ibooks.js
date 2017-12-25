"use strict";

const cheerio = require("cheerio");

const Parser = function(mail) {
  this.mail = mail;
};

Parser.prototype.parseable = function() {
  if (this.mail.html) {
    const $ = cheerio.load(this.mail.html);
    const annotations = $(".annotation");
    return annotations.length > 0;
  }
};

Parser.prototype.parse = function() {
  const $ = cheerio.load(this.mail.html);
  const annotations = $(".annotation");
  const titleEl = $(".booktitle");
  const title = titleEl.text().trim();
  const author = titleEl
    .next("h2")
    .text()
    .trim();

  return {
    book: {
      title: title,
      author: author
    },
    highlights: this.parseHighlights(annotations)
  };
};

Parser.prototype.parseHighlights = function(annotations) {
  const highlights = [];

  annotations.each(function(i, el) {
    const note = cheerio(el)
      .find(".annotationnote")
      .html()
      .trim();
    const highlight = {
      content: cheerio(el)
        .find(".annotationrepresentativetext")
        .text()
        .trim(),
      date: cheerio(el)
        .find(".annotationdate")
        .text()
        .trim(),
      location: cheerio(el)
        .find(".annotationchapter")
        .text()
        .trim(),
      source: "ibooks"
    };

    if (note) highlight.comments = [{ body: note }];

    highlights.push(highlight);
  });

  return highlights;
};

module.exports = Parser;
