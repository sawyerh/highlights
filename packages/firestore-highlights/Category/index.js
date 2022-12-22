const _ = require("lodash");

class Category {
	/**
	 * Return all highlights with this Category
	 * @param {String} name - Category name (or key)
	 * @returns {PublicHighlight[]}
	 */
	static highlights() {
		// const key = this.key(name);
		// db.collection("highlights").where(`categories.${key}`, "==", true);
	}

	/**
	 * Create an object key to be used for this category's index
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
	return Category;
};
