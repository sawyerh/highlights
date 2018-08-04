/**
 * Return a connection to the Firestore DB
 */
const admin = require("firebase-admin");
let DB;

module.exports = function() {
  if (DB) return DB;

  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.SERVICE_ACCOUNT))
  });

  DB = admin.firestore();
  DB.settings({ timestampsInSnapshots: true });
  return DB;
};
