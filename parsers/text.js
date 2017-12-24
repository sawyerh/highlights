"use strict";

const Parser = function(mail) {
  this.mail = mail;
};

Parser.prototype.parseable = function() {
  return this.mail.text && this.mail.text.indexOf("++") === 0;
};

Parser.prototype.parse = function() {
  const title = this.mail.subject;
  const blocks = this.mail.text.split("\n\n\n");
  const authorMatch = blocks.shift().match(/^\+\+(.*)/);
  let author = null;

  if (authorMatch.length === 2) author = authorMatch[1];

  return {
    book: {
      title: title,
      author: author
    },
    highlights: this.parseHighlights(blocks)
  };
};

Parser.prototype.parseHighlights = function(blocks) {
  const highlights = [];

  blocks.forEach(function(block) {
    const cleanedBlock = block.trim();
    if (cleanedBlock !== "") highlights.push({ content: cleanedBlock });
  });

  return highlights;
};

module.exports = Parser;
