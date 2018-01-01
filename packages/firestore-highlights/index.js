const Category = require("./Category");
const Entity = require("./Entity");
const Highlight = require("./Highlight");
const Volume = require("./Volume");

/**
 * @param {Firestore} firestore - The Firestore Database client.
 * @returns {Object} models
 */
module.exports = firestore => {
  return {
    Category: Category(firestore),
    Entity: Entity(firestore),
    Highlight: Highlight(firestore),
    Volume: Volume(firestore)
  };
};
