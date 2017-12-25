const _ = require("lodash");

/**
 *
 * @param {Object} volume
 * @param {Array<Object>} newHighlights
 * @param {Array<Object>} existingHighlights
 * @returns {Array<Object>}
 */
function filterOutExistingHighlights(
  volume,
  newHighlights,
  existingHighlights
) {
  if (!existingHighlights.length) return newHighlights;

  existingHighlights = _.where(existingHighlights, {
    metadata: {
      book_uuid: volume.metadata.uuid
    }
  });

  if (existingHighlights.length) {
    const highlightBodies = existingHighlights.map(highlight =>
      highlight.body.trim()
    );

    newHighlights = _.reject(newHighlights, highlight =>
      _.includes(highlightBodies, highlight.content.trim())
    );
  }

  return newHighlights;
}

module.exports = filterOutExistingHighlights;
