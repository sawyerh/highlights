const Highlight = require("./Highlight");
const Volume = require("./Volume");
const async = require("async");
const filterExistingHighlights = require("./filterExistingHighlights");

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
    createHighlights(highlights, volume)
  );
}

/**
 * Create highlights (after filtering any that already exists)
 * @param {Array<Object>} highlights
 * @param {Object} volume
 * @returns {Promise}
 */
function createHighlights(highlights, volumeRef) {
  return console.log("createHighlights", volumeRef);

  return getHighlights() // First we check if any of these highlights already exist and ignore them if so.
    .then(filterExistingHighlights.bind(null, volume, highlights))
    .then(filteredHighlights => {
      if (!filteredHighlights.length)
        return Promise.reject(new Error("No new highlights."));

      return new Promise(resolve => {
        async.eachSeries(
          filteredHighlights,
          (highlight, cb) => {
            createHighlight(highlight, volume).then(() => cb());
          },
          resolve
        );
      });
    });
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
