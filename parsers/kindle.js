"use strict";

var parseAttachment = require('./helpers/parse-attachment');
var Clipper = require('./kindle-clipper');
var _ = require('lodash');

var Parser = function(mail) {
  this.mail = mail;
  this.results = [];
};

Parser.prototype.parseable = function () {
  return this.parseableAttachments().length > 0;
};

Parser.prototype.parseableAttachments = function () {
  var attachments = this.mail.attachments;
  if (!attachments) return [];

  return attachments.filter(function (attachment) {
    var parsedAtt = parseAttachment(attachment);
    return parsedAtt.type == 'json' && parsedAtt.content.hasOwnProperty('totalHighlights') || parsedAtt.type == 'text';
  });
};

Parser.prototype.parse = function () {
  var self = this;

  var attachments = this.parseableAttachments();

  attachments.forEach(function (attachment) {
    var parsedAtt = parseAttachment(attachment);

    if (parsedAtt.type == 'json') {
      self.parseBookmarkletExport(parsedAtt.content);
    } else if (parsedAtt.type == 'text') {
      self.parseClippings(parsedAtt.content);
    }
  });

  return this.results;
};

// BOOKMARKLET
// =================================
Parser.prototype.parseBookmarkletExport = function (content) {
  var self = this;

  content.highlights.forEach(function (content) {
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

Parser.prototype.parseBookmarkletHighlights = function (highlightedText) {
  var self = this;

  var highlights = [];

  highlightedText.forEach(function (highlight) {
    highlights.push(self.createBookmarkletHighlight(highlight));
  });

  return highlights;
};

Parser.prototype.createBookmarkletHighlight = function (btHighlight) {
  var highlight = {
    content: btHighlight.content,
    location: btHighlight.kindleLocation,
    source: 'kindle'
  };

  if (btHighlight.comment && btHighlight.comment !== '') highlight.comments = [{ body: btHighlight.comment }];

  return highlight;
};

// CLIPPINGS
// =================================
Parser.prototype.parseClippings = function (content) {
  var self = this;

  var clipper = new Clipper();
  var clippings = clipper.getParsed(content);
  clippings = _.groupBy(clippings, 'title');
  var groups = Object.getOwnPropertyNames(clippings);

  groups.forEach(function (name) {
    var group = clippings[name];
    if (!group.length) return;
    var first = group[0];
    self.results.push({
      book: {
        title: first.title,
        author: first.author
      },
      highlights: self.parseClippingHighlights(group)
    });
  });
};

Parser.prototype.parseClippingHighlights = function (group) {
  var self = this;

  return group.map(function (clipping) {
    return self.createClippingHighlight(clipping);
  });
};

Parser.prototype.createClippingHighlight = function (clipping) {
  return {
    content: clipping.text,
    location: clipping.location,
    source: 'kindle'
  };
};

module.exports = Parser;
