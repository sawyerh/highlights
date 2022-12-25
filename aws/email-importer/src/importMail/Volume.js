const { getFirestore, Timestamp } = require("firebase-admin/firestore");

class LambdaVolume {
	/**
	 * @param {Object} props
	 * @param {String} props.title
	 * @param {String} props.importTitle
	 * @param {Array<String>} props.authors
	 * @returns {Promise<Object>} Volume DocumentReference
	 */
	static create(props) {
		const db = getFirestore();
		return db
			.collection("volumes")
			.add({
				authors: props.authors,
				createdAt: Timestamp.now(),
				highlightsCount: props.highlightsCount,
				importTitle: props.title,
				title: props.title,
				visible: true,
			})
			.then((ref) => {
				console.log("Created Volume", ref.id);
				return ref;
			});
	}

	/**
	 * @param {String} title
	 * @returns {Promise<Object>} DocumentSnapshot
	 */
	static findByImportTitle(title) {
		const db = getFirestore();
		return db.collection("volumes").where("importTitle", "==", title).get();
	}

	/**
	 * @param {Object} props
	 * @param {String} props.title
	 * @returns {Promise<Object>} Volume DocumentReference
	 */
	static findOrCreate(props) {
		return this.findByImportTitle(props.title).then((snapshot) => {
			if (snapshot.empty) {
				return this.create(props);
			}
			const ref = snapshot.docs[0].ref;
			console.log("Found existing Volume", ref.id);
			return ref;
		});
	}
}

module.exports = LambdaVolume;
