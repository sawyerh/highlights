const db = require("./firestore")();
const Volume = {};

/**
 * @param {Object} props
 * @property {String} props.title
 * @returns {Promise<Object>} Resolves with volume object
 */
Volume.findOrCreate = function(props) {
  return this.findByImportTitle(props.title).then(snapshot => {
    if (snapshot.empty) {
      return this.create(props);
    } else {
      return snapshot.docs[0].ref;
    }
  });
};

/**
 * @param {Objects} props
 * @property {String} props.title
 * @property {String} props.importTitle
 * @property {Array<String>} props.authors
 * @returns {Promise<Object>} Snapshot
 */
Volume.create = function(props) {
  return db.collection("volumes").add({
    authors: props.authors,
    importTitle: props.title,
    title: props.title
  });
};

/**
 * @param {String} title
 * @returns {Promise<Object>} Snapshot
 */
Volume.findByImportTitle = function(title) {
  return db
    .collection("volumes")
    .where("importTitle", "==", title)
    .get();
};

module.exports = Volume;
