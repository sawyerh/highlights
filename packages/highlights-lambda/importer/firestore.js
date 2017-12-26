/**
 * Return a connection to the Firestore DB
 */
const Firestore = require("@google-cloud/firestore");
let DB;

module.exports = function() {
  if (DB) return DB;

  DB = new Firestore({
    projectId: "sawyer-highlights-dev",
    credentials: JSON.parse(process.env.SERVICE_ACCOUNT)
  });

  return DB;
};
