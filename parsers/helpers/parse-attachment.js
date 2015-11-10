'use strict';

module.exports = function (attachment) {
  var type, content;

  if (attachment.contentType == 'application/json' || attachment.contentType == 'text/plain') {
    type = attachment.contentType == 'application/json' ? 'json' : 'text';
    content = attachment.content.toString('utf8');
  } else {
    type = attachment.contentType;
    content = null;
  }

  return {
    type: type,
    content: type == 'json' ? JSON.parse(content) : content
  };
};
