const _ = require("lodash");

let Category;
let db;

/**
 * @typedef PublicVolume
 * @property {Number} id
 * @property {Array<String>} authors
 * @property {String} image
 * @property {String} title
 * @property {String} subtitle
 */

class Volume {
  /**
   * Return a whitelist of attributes we want
   * publicly accessible via the API.
   * @param {DocumentSnapshot} doc
   * @returns {PublicVolume}
   */
  static attrs(doc) {
    const data = doc.data();
    return {
      id: doc.ref.id,
      title: data.title,
      subtitle: data.subtitle,
      authors: data.authors,
      image: data.image,
      format: data.format,
    };
  }

  /**
   * @param {Array[]} filters - https://cloud.google.com/nodejs/docs/reference/firestore/latest/Query?authuser=0#where
   * @returns {Promise<PublicVolume[]>}
   */
  static all(filters) {
    let query = db.collection("volumes");

    if (filters) {
      filters.forEach(filter => {
        query = query.where.apply(query, filter);
      });
    }

    return query
      .orderBy("createdAt", "desc")
      .get()
      .then(snapshot => snapshot.docs.map(this.attrs));
  }

  /**
   * @param {String|DocumentReference} id
   */
  static find(id) {
    const ref = typeof id === "string" ? db.collection("volumes").doc(id) : id;

    return ref.get().then(snap => {
      return this.attrs(snap);
    });
  }

  /**
   * Create index object for a Volume's categories
   * @param {String[]} categories
   * @returns {Object}
   */
  static indexCategories(categories) {
    if (_.isArray(categories)) {
      const index = {};

      categories.forEach(name => {
        index[Category.key(name)] = true;
      });

      return index;
    }

    return null;
  }
}

/**
 * @param {Firestore} firestore - The Firestore Database client.
 * @returns {Class}
 */
module.exports = firestore => {
  Category = require("../Category")(firestore);
  db = firestore;

  return Volume;
};
