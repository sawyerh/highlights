const _ = require("lodash");

let db;

class Entity {
  static attrs(data) {
    delete data.mentions;
    return data;
  }

  /**
   * Return all highlights with this entity
   * @param {String} name - Entity name (or key)
   * @returns {PublicHighlight[]}
   */
  static highlights(name) {
    const key = this.key(name);

    // db
    //   .collection("highlights")
    //   .where(`languageAnalysis.entityKeys.${key}`, "==", true);
  }

  /**
   * Create an object key to be used for this entities index
   * @param {String} name
   * @returns {String}
   */
  static key(name) {
    return _.camelCase(name);
  }
}

/**
 * @param {Firestore} firestore - The Firestore Database client.
 * @returns {Class}
 */
module.exports = firestore => {
  db = firestore;

  return Entity;
};
