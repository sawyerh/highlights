'use strict';

module.exports = function (attachment) {
  var type, content;
  var index = ['application/json', 'text/html', 'text/plain'].indexOf(attachment.contentType);

  if (index >= 0) {
    var types = ['json', 'html', 'text']; // IDK
    type = types[index];
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
