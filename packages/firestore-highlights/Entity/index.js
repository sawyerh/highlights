const _ = require("lodash");

class Entity {
  static attrs(data) {
    delete data.mentions;
    return data;
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
module.exports = () => {
  return Entity;
};
