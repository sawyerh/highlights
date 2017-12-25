const config = require("../siteleaf.config.js");
const Siteleaf = require("siteleaf-api");
const slug = require("slug");
const truncate = require("truncate");
const uuid = require("uuid");

const siteleaf = new Siteleaf({
  apiKey: config.key,
  apiSecret: config.secret
});

/**
 * @param {Object} highlight
 * @param {Object} volume
 * @returns {Promise<Object>}
 */
function createHighlight(highlight, volume) {
  const truncatedTitle = truncate(volume.title, 20, { ellipsis: null });

  const params = {
    body: highlight.content,
    title: truncatedTitle + ": " + truncate(highlight.content, 60),
    path: slug(truncatedTitle + "-" + uuid.v4(), { lower: true }),
    metadata: {
      book_uuid: volume.metadata.uuid,
      notes: highlight.notes,
      location: highlight.location ? String(highlight.location) : null // convert to string so we can sort in Liquid
    }
  };

  return siteleaf.request(
    `sites/${config.site}/collections/${config.highlights}/documents`,
    {
      method: "POST",
      body: params
    }
  );
}

module.exports = createHighlight;
