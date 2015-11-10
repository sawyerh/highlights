"use strict";

var cheerio = require('cheerio');

var Parser = function(mail) {
  this.mail = mail;
};

Parser.prototype.parseable = function () {
  var $ = cheerio.load(this.mail.html);
  var annotations = $('.annotation');
  return annotations.length > 0;
};

Parser.prototype.parse = function () {
  var $ = cheerio.load(this.mail.html);
  var annotations = $('.annotation');
  var titleEl = $('.booktitle');
  var title = titleEl.text().trim();
  var author = titleEl.next('h2').text().trim();

  return {
    book: {
      title: title,
      author: author
    },
    highlights: this.parseHighlights(annotations)
  };
};

Parser.prototype.parseHighlights = function (annotations) {
  var highlights = [];

  annotations.each(function (i, el) {
    var note = cheerio(el).find('.annotationnote').html().trim();
    var highlight = {
      content: cheerio(el).find('.annotationrepresentativetext').text().trim(),
      date: cheerio(el).find('.annotationdate').text().trim(),
      location: cheerio(el).find('.annotationchapter').text().trim(),
      source: 'ibooks'
    };

    if (note) highlight.comments = [{ body: note }];

    highlights.push(highlight);
  });

  return highlights;
};

module.exports = Parser;
