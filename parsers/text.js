"use strict";

var Parser = function(mail) {
  this.mail = mail;
};

Parser.prototype.parseable = function () {
  return (this.mail.text && this.mail.text.indexOf('++') === 0)
};

Parser.prototype.parse = function () {
  var title = this.mail.subject;
  var blocks = this.mail.text.split('\n\n\n');
  var authorMatch = blocks.shift().match(/^\+\+(.*)/);
  var author = null;

  if(authorMatch.length == 2)
    author = authorMatch[1];

  return {
    book: {
      title: title,
      author: author
    },
    highlights: this.parseHighlights(blocks)
  };
};

Parser.prototype.parseHighlights = function (blocks) {
  var highlights = [];

  blocks.forEach(function (block) {
    var cleanedBlock = block.trim();
    if(cleanedBlock !== '')
      highlights.push({ content: cleanedBlock });
  });

  return highlights;
};

module.exports = Parser;
