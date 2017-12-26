const Highlight = require("./Highlight");
const Volume = require("./Volume");
const kindleToJSON = require("kindle-email-to-json");
const textToJSON = require("highlights-email-to-json");

/**
 * Create the volume and highlights when they don't already exists
 * @param {Object} data
 * @param {Object} data.volume
 * @param {Array<Object>} data.highlights
 * @param {Boolean} debug
 * @returns {Promise}
 */
function addVolumeAndHighlights(data, debug) {
  const { highlights, volume } = data;

  if (!highlights.length)
    return Promise.reject(new Error("No highlights to import"));

  return Volume.findOrCreate(volume).then(volume =>
    Highlight.importAll(highlights, volume)
  );
}

function importer(mail, debug = false) {
  return kindleToJSON(mail).then(
    data => addVolumeAndHighlights(data, debug),
    err => {
      // kindleToJSON rejects if the mail format is invalid
      console.log(err);
      return textToJSON(mail).then(data => addVolumeAndHighlights(data, debug));
    }
  );
}

module.exports = importer;
