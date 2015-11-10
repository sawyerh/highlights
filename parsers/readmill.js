"use strict";

var parseAttachment = require('./helpers/parse-attachment');

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
    var content = parsedAtt.content;
    return parsedAtt.type == 'json' && (content.hasOwnProperty('readings') || content.hasOwnProperty('liked_highlights'));
  });
};

Parser.prototype.parse = function () {
  var self = this;
  var attachments = this.parseableAttachments();

  attachments.forEach(function (attachment) {
    var parsedAtt = parseAttachment(attachment);

    if (parsedAtt.content.hasOwnProperty('readings')) {
      self.parseReadings(parsedAtt.content);
    } else if (parsedAtt.content.hasOwnProperty('liked_highlights')) {
      self.parseLikedHighlights(parsedAtt.content);
    }
  });

  return this.results;
};

Parser.prototype.parseReadings = function (content) {
  var self = this;

  content.readings.forEach(function (reading) {
    var highlights = self.parseHighlights(reading);
    if (!highlights.length) return;

    self.results.push({
      book: reading.book,
      highlights: highlights
    });
  });
};

Parser.prototype.parseLikedHighlights = function (content) {
  var self = this;

  content.liked_highlights.forEach(function (highlight) {
    self.results.push({
      book: highlight.book,
      highlights: [self.createHighlight(highlight, true)]
    });
  });
};

Parser.prototype.parseHighlights = function (reading) {
  var self = this;
  var highlights = [];

  reading.highlights.forEach(function (highlight) {
    highlights.push(self.createHighlight(highlight));
  });

  return highlights;
};

Parser.prototype.parseComments = function (highlight) {
  if (!highlight.comments.length) return;

  var comments = [];

  highlight.comments.forEach(function (comment) {
    comments.push({
      body: comment.content,
      date: comment.posted_at,
      user: comment.user
    });
  });

  return comments;
};

Parser.prototype.createHighlight = function (highlight, includeUser) {
  var obj = {
    content: highlight.content,
    date: highlight.highlighted_at,
    source: 'readmill'
  };

  var comments = this.parseComments(highlight);

  if (comments) obj.comments = comments;

  if (highlight.position) obj.location = highlight.position;

  if (includeUser) obj.user = highlight.user;

  return obj;
};

module.exports = Parser;
