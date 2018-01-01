const _ = require("lodash");
const Category = require("../Category");
const Entity = require("../Entity");
const admin = require("firebase-admin");
const db = admin.firestore();

/**
 * @typedef PublicHighlight
 * @property {Number} id
 * @property {String} body
 * @property {String} location
 * @property {Object} sentiment
 * @property {Array} entities
 */

class Highlight {
  /**
   * Return a whitelist of attributes we want
   * publicly accessible via the API.
   * @param {DocumentSnapshot} doc
   * @returns {PublicHighlight}
   */
  static attrs(doc) {
    const data = doc.data();

    return {
      id: doc.ref.id,
      body: data.body,
      location: data.location,
      sentiment: data.documentSentiment,
      entities: this.properEntities(data)
    };
  }

  /**
   * Create index object for a Highlight's categories
   * @param {Object[]} categories
   * @returns {Object}
   */
  static indexCategories(categories) {
    if (_.isArray(categories)) {
      const index = {};

      categories.forEach(category => {
        index[Category.key(category.name)] = true;
      });

      return index;
    }

    return null;
  }

  /**
   * Create index object for a Highlight's entities. !! You need to
   * filter these before passing entities in, if you only want
   * to index a subset of entities !!
   * @param {Object[]} entities
   * @returns {Object}
   */
  static indexEntities(entities) {
    if (_.isArray(entities)) {
      const index = {};

      entities.forEach(entity => {
        index[Entity.key(entity.name)] = true;
      });

      return index;
    }

    return null;
  }

  /**
   * Return only proper entities and those with a Wikipedia URL
   * @param {Object} data - Document data
   * @returns {Array} entities
   */
  static properEntities(data) {
    const entities = data.languageAnalysis
      ? data.languageAnalysis.entities
      : null;

    if (_.isArray(entities)) {
      return entities
        .filter(
          entity =>
            entity.metadata.wikipedia_url ||
            entity.mentions.some(mention => mention.type === "PROPER")
        )
        .map(entity => Entity.attrs(entity));
    }
  }

  /**
   * Find all highlights in a Volume
   * @param {Object} ref - DocumentReference
   * @param {Function} beforeQuery - Method for modifying the query before its executed
   */
  static whereVolume(ref, beforeQuery) {
    const query = db.collection("highlights").where("volume", "==", ref);

    if (beforeQuery) beforeQuery(query);

    return query.get();
  }
}

module.exports = Highlight;
