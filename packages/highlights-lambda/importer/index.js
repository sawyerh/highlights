const _ = require("lodash");
const async = require("async");
const config = require("../siteleaf.config.js");
const createHighlight = require("./createHighlight");
const filterExistingHighlights = require("./filterExistingHighlights");
const merge = require("merge");
const moment = require("moment");
const uuid = require("uuid");

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

  return findOrCreateVolume({
    title: volume.title,
    metadata: {
      author: volume.author,
      uuid: uuid.v4()
    }
  }).then(volume => createHighlights(highlights, volume));
}

/**
 * @returns {Promise<Object>}
 */
function getHighlights() {
  return siteleaf.request(
    `sites/${config.site}/collections/${config.highlights}/documents`,
    {
      qs: { per_page: 9999 }
    }
  );
}

/**
 * Create highlights (after filtering any that already exists)
 * @param {Array<Object>} highlights
 * @param {Object} volume
 * @returns {Promise}
 */
function createHighlights(highlights, volume) {
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

/**
 * Get existing volumes
 * @returns {Promise<Array>}
 */
function volumes() {
  return siteleaf.request(
    `sites/${config.site}/collections/${config.books}/documents`,
    {
      qs: { per_page: 9999 }
    }
  );
}

/**
 * @param {Object} props
 * @param {String} props.title
 * @returns {Promise<Object>} Resolves with volume object
 */
function findOrCreateVolume(props) {
  return volumes().then(books => {
    // We compare the original_title, this way we can change the display title
    // if for some reason it isn't accurate
    const existing = _.findWhere(books, {
      metadata: {
        original_title: props.title
      }
    });

    if (existing) {
      return Promise.resolve(existing);
    } else {
      return createVolume(props);
    }
  });
}

/**
 * @param {Objects} params
 * @returns {Promise<Object>}
 */
function createVolume(params) {
  params.metadata = merge(params.metadata, { original_title: params.title });
  params.date = moment()
    .utcOffset("-05:00")
    .format();

  return siteleaf.request(
    `sites/${config.site}/collections/${config.books}/documents`,
    {
      method: "POST",
      body: params
    }
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
