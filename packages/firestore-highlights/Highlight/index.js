const _ = require("lodash");

let Category;
let Entity;
let Volume;
let db;

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
   * @param {Boolean} includeVolume
   * @returns {PublicHighlight}
   */
  static attrs(doc, includeVolume = true) {
    const data = doc.data();

    const res = {
      id: doc.ref.id,
      body: data.body,
      location: data.location,
      sentiment: data.documentSentiment,
      entities: this.properEntities(data),
      visible: data.visible
    };

    if (includeVolume) {
      res.volume = { id: data.volume.id };
    }

    return res;
  }

  /**
   * Find all highlights
   * @param {Function} beforeQuery - Method for modifying the query before its executed
   * @returns {Promise<Array>}
   */
  static all(beforeQuery) {
    const query = db.collection("highlights");

    if (beforeQuery) beforeQuery(query);

    return query.get().then(snap => {
      return snap.docs.map(doc => this.attrs(doc));
    });
  }

  /**
   * @param {String|DocumentReference} id
   */
  static find(id) {
    const ref =
      typeof id === "string" ? db.collection("highlights").doc(id) : id;

    return ref.get().then(snap => {
      return this.attrs(snap);
    });
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
            (entity.mentions && // some entities don't have any mentions
              entity.mentions.some(mention => mention.type === "PROPER"))
        )
        .map(entity => Entity.attrs(entity));
    }
  }

  /**
   * Find all highlights with an Entity
   * @param {String} name - Entity name
   * @param {Function} beforeQuery - Method for modifying the query before its executed
   */
  static whereEntity(name, beforeQuery) {
    const res = { name: name };
    const key = _.camelCase(name);

    const query = db
      .collection("highlights")
      .where(`indexEntities.${key}`, "==", true);

    if (beforeQuery) beforeQuery(query);

    return query.get().then(snap => {
      if (snap.empty) {
        return res;
      }
      const highlights = snap.docs.map(doc => this.attrs(doc));

      // Get additional entity info from a highlight
      const entity = _.find(highlights[0].entities, { name: name });
      const { type, metadata } = Entity.attrs(entity);

      return Object.assign(res, { type, metadata, highlights });
    });
  }

  /**
   * Find all highlights in a Volume
   * @param {String|DocumentReference} id
   * @param {Function} beforeQuery - Method for modifying the query before its executed
   */
  static whereVolume(id, beforeQuery) {
    const volumeRef =
      typeof id === "string" ? db.collection("volumes").doc(id) : id;
    const highlightsQuery = db
      .collection("highlights")
      .where("volume", "==", volumeRef);
    let res = {};

    if (beforeQuery) beforeQuery(highlightsQuery);

    return Volume.find(volumeRef)
      .then(volume => {
        res = volume;
      })
      .then(() => {
        return highlightsQuery.get().then(snap => {
          if (!snap.empty) {
            res.highlights = snap.docs.map(doc => this.attrs(doc));
          }

          return res;
        });
      });
  }
}

/**
 * @param {Firestore} firestore - The Firestore Database client.
 * @returns {Class}
 */
module.exports = firestore => {
  Category = require("../Category")(firestore);
  Entity = require("../Entity")(firestore);
  Volume = require("../Volume")(firestore);
  db = firestore;

  return Highlight;
};
