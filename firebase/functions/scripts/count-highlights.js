/**
 * @file Run an aggregation query to get the total number of highlights. Returns
 * the total number, as well as totals per volume.
 *
 * To use this script:
 *
 * export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
 * node count-highlights.js
 */
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

async function getTotalHighlights() {
	let query = db.collection("highlights");

	// Useful for confirming the connection works before running a potentially expensive query:
	// query = query.limit(1);

	const snapshot = await query.count().get();
	return snapshot.data().count;
}

getTotalHighlights().then((count) => {
	console.log("Total highlights:", count);
});
