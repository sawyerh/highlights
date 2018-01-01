const _ = require("lodash");
const Firestore = require("@google-cloud/firestore");
const db = require("./firestore")();
const hash = require("string-hash");

const Highlight = require("@sawyerh/firestore-highlights/Highlight")(db);

class LambdaHighlight extends Highlight {
  /**
   *
   * @param {Array<Object>} highlights
   * @param {Object} volume DocumentReference
   */
  static batchCreateAll(highlights, volume) {
    const batch = db.batch();
    highlights.forEach(highlight => this.batchCreate(highlight, volume, batch));
    return batch.commit().then(results => {
      if (results.length) {
        console.log(`Created ${results.length} highlights`);
      }
    });
  }

  /**
   * @param {Object} highlight
   * @param {Object} volume DocumentReference
   * @param {Object} batch
   * @returns {Promise<Object>}
   */
  static batchCreate(highlight, volume, batch) {
    const ref = db.collection("highlights").doc();

    // Pull out the properties we know we'll be present,
    // then pass the rest of the object into Object.assign
    // so we can capture all other props that might be present
    const content = highlight.content;
    const hash = highlight.hash;
    delete highlight.content;
    delete highlight.hash;

    const data = Object.assign(
      {
        body: content,
        createdAt: Firestore.FieldValue.serverTimestamp(),
        hash: hash,
        volume: volume
      },
      highlight
    );

    return batch.create(ref, data);
  }

  /**
   *
   * @param {Object} volume
   * @param {Array<Object>} newHighlights
   * @param {Array<Object>} existingHighlights
   * @returns {Array<Object>}
   */
  static filterExisting(newHighlights, existingHighlights) {
    const hashes = existingHighlights.map(highlight => highlight.get("hash"));

    newHighlights = _.reject(newHighlights, highlight =>
      _.includes(hashes, highlight.hash)
    );

    return newHighlights;
  }

  /**
   * Create highlights (after filtering any that already exists)
   * @param {Array<Object>} allHighlights - Identified in email
   * @param {Object} volume - DocumentReference
   * @returns {Promise}
   */
  static importAll(allHighlights, volume) {
    // Add the hash so we can compare against existing hash, and
    // save to the DB if this highlight doesn't exist
    allHighlights.forEach(highlight => {
      highlight.hash = hash(highlight.content);
    });

    return Highlight.whereVolume(volume, query => query.select("hash"))
      .then(snapshot => {
        if (snapshot.empty) {
          return allHighlights;
        }
        return this.filterExisting(allHighlights, snapshot.docs);
      })
      .then(highlights => {
        if (!highlights.length)
          return Promise.reject(new Error("No new highlights."));

        return this.batchCreateAll(highlights, volume);
      });
  }
}

module.exports = LambdaHighlight;
