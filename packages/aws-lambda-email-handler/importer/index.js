const Highlight = require("./Highlight");
const Volume = require("./Volume");
const kindleToJSON = require("kindle-email-to-json");
const textToJSON = require("highlights-email-to-json");

/**
 * Create the volume and highlights when they don't already exists
 * @param {Object} data
 * @param {Object} data.volume
 * @param {Array<Object>} data.highlights
 * @returns {Promise}
 */
function addVolumeAndHighlights(data) {
  const { highlights, volume } = data;
  volume.highlightsCount = highlights.length;

  if (!highlights.length)
    return Promise.reject(new Error("No highlights to import"));

  return Volume.findOrCreate(volume).then(volume =>
    Highlight.importAll(highlights, volume)
  );
}

function importer(mail) {
  return kindleToJSON(mail)
    .then(addVolumeAndHighlights)
    .catch(kindleError => {
      if (kindleError.message.match(/No new highlights/)) {
        console.log(kindleError.message);
        return Promise.resolve();
      }

      return textToJSON(mail)
        .then(addVolumeAndHighlights)
        .catch(textError => {
          console.log("kindleToJSON", kindleError);
          console.log("textToJSON", textError);
        });
    });
}

module.exports = importer;
