"use strict";

const parseAttachment = require("./helpers/parse-attachment");
const Clipper = require("./kindle-clipper");
const KindleHTMLParser = require("./kindle-html");
const _ = require("lodash");

const Parser = function(mail) {
  this.mail = mail;
  this.results = [];
};

Parser.prototype.parseable = function() {
  return this.parseableAttachments().length > 0;
};

Parser.prototype.parseableAttachments = function() {
  const attachments = this.mail.attachments;
  if (!attachments) return [];

  return attachments.filter(function(attachment) {
    const parsedAtt = parseAttachment(attachment);
    const isValidJson =
      parsedAtt.type === "json" &&
      parsedAtt.content.hasOwnProperty("totalHighlights");
    return (
      isValidJson || parsedAtt.type === "text" || parsedAtt.type === "html"
    );
  });
};

Parser.prototype.parse = function() {
  const self = this;

  const attachments = this.parseableAttachments();

  attachments.forEach(function(attachment) {
    const parsedAtt = parseAttachment(attachment);

    if (parsedAtt.type === "json") {
      self.parseBookmarkletExport(parsedAtt.content);
    } else if (parsedAtt.type === "text") {
      self.parseClippings(parsedAtt.content);
    } else {
      const parser = new KindleHTMLParser(parsedAtt.content);
      if (parser.parseable()) self.results.push(parser.parse());
    }
  });

  return this.results;
};

// BOOKMARKLET
// =================================
Parser.prototype.parseBookmarkletExport = function(content) {
  const self = this;

  content.highlights.forEach(function(content) {
    if (!content.highlightedText.length) return;

    self.results.push({
      book: {
        title: content.title,
        asin: content.asin
      },
      highlights: self.parseBookmarkletHighlights(content.highlightedText)
    });
  });
};

Parser.prototype.parseBookmarkletHighlights = function(highlightedText) {
  const self = this;

  const highlights = [];

  highlightedText.forEach(function(highlight) {
    highlights.push(self.createBookmarkletHighlight(highlight));
  });

  return highlights;
};

Parser.prototype.createBookmarkletHighlight = function(btHighlight) {
  const highlight = {
    content: btHighlight.content,
    location: btHighlight.kindleLocation,
    source: "kindle"
  };

  if (btHighlight.comment && btHighlight.comment !== "")
    highlight.comments = [{ body: btHighlight.comment }];

  return highlight;
};

// CLIPPINGS
// =================================
Parser.prototype.parseClippings = function(content) {
  const self = this;

  const clipper = new Clipper();
  let clippings = clipper.getParsed(content);
  clippings = _.groupBy(clippings, "title");
  const groups = Object.getOwnPropertyNames(clippings);

  groups.forEach(function(name) {
    const group = clippings[name];
    if (!group.length) return;
    const first = group[0];
    self.results.push({
      book: {
        title: first.title,
        author: first.author
      },
      highlights: self.parseClippingHighlights(group)
    });
  });
};

Parser.prototype.parseClippingHighlights = function(group) {
  const self = this;

  return group.map(function(clipping) {
    return self.createClippingHighlight(clipping);
  });
};

Parser.prototype.createClippingHighlight = function(clipping) {
  return {
    content: clipping.text,
    location: clipping.location,
    source: "kindle"
  };
};

module.exports = Parser;
