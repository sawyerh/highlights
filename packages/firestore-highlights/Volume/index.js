const _ = require("lodash");

let Category;
let Highlight;
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
      image: data.image
    };
  }

  /**
   * @returns {Promise<PublicVolume[]>}
   */
  static all() {
    return db
      .collection("volumes")
      .get()
      .then(snapshot => snapshot.docs.map(this.attrs));
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

  /**
   * Return a volume along with its highlights
   * @param {Number} id - Volume ID
   * @param {Object}
   */
  static withHighlights(id) {
    const volumeRef = db.collection("volumes").doc(id);
    let res = {};

    return volumeRef
      .get()
      .then(doc => {
        res = this.attrs(doc);
        return Highlight.whereVolume(doc.ref);
      })
      .then(snap => {
        if (!snap.empty) {
          res.highlights = snap.docs.map(doc => Highlight.attrs(doc));
        }

        return res;
      });
  }
}

/**
 * @param {Firestore} firestore - The Firestore Database client.
 * @returns {Class}
 */
module.exports = firestore => {
  Category = require("../Category")(firestore);
  Highlight = require("../Highlight")(firestore);
  db = firestore;

  return Volume;
};
