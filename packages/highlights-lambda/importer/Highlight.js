function Highlight() {}

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
 * @param {Object} highlight
 * @param {Object} volume
 * @returns {Promise<Object>}
 */
function create(highlight, volume) {
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

module.exports = Highlight;
