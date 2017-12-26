const db = require("./firestore")();
const Firestore = require("@google-cloud/firestore");

class Volume {
  /**
   * @param {Object} props
   * @param {String} props.title
   * @param {String} props.importTitle
   * @param {Array<String>} props.authors
   * @returns {Promise<Object>} Snapshot
   */
  static create(props) {
    return db.collection("volumes").add({
      authors: props.authors,
      createdAt: Firestore.FieldValue.serverTimestamp(),
      importTitle: props.title,
      title: props.title
    });
  }

  /**
   * @param {String} title
   * @returns {Promise<Object>} Snapshot
   */
  static findByImportTitle(title) {
    return db
      .collection("volumes")
      .where("importTitle", "==", title)
      .get();
  }

  /**
   * @param {Object} props
   * @param {String} props.title
   * @returns {Promise<Object>} Resolves with volume object
   */
  static findOrCreate(props) {
    return this.findByImportTitle(props.title).then(snapshot => {
      if (snapshot.empty) {
        return this.create(props);
      }
      return snapshot.docs[0].ref;
    });
  }
}

module.exports = Volume;
