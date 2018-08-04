const Highlight = require("./Highlight");
const Volume = require("./Volume");
const someSeries = require("async/someSeries");
const kindleEmailToJSON = require("kindle-email-to-json");
const textToJSON = require("highlights-email-to-json");

/**
 * Create the volume and highlights when they don't already exists
 * @param {Object} data
 * @param {Object} data.volume
 * @param {Array<Object>} data.highlights
 * @returns {Promise}
 */
async function addVolumeAndHighlights(data) {
  const { highlights, volume } = data;
  volume.highlightsCount = highlights.length;

  if (!highlights.length)
    return Promise.reject(new Error("No highlights to import"));

  const volumeDoc = await Volume.findOrCreate(volume);
  return Highlight.importAll(highlights, volumeDoc);
}

/**
 * Run all possible importers (e.g. Kindle, plain text)
 * @param {Object} mail
 * @returns {Promise}
 */
function importMail(mail) {
  return new Promise((resolve, reject) => {
    const importers = [kindleEmailToJSON, textToJSON];

    someSeries(
      importers,
      async runImporter => {
        // each importer is ran in serial and stops once one runs successfully
        try {
          const data = await runImporter(mail);
          await addVolumeAndHighlights(data);
          return true;
        } catch (err) {
          console.log(err.message);
          return !!err.message.match(/No new highlights/);
        }
      },
      (e, importerSuccess) => {
        if (importerSuccess) return resolve();
        return reject(Error("No importer was able to process the email."));
      }
    );
  });
}

module.exports = importMail;
