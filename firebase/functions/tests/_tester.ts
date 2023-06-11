import path from "path";

import test from "firebase-functions-test";

import projectConfig from "../secrets/test-app.json";

/**
 * https://firebase.google.com/docs/functions/unit-testing
 */
export default test(
	projectConfig,
	path.resolve(__dirname, "../secrets/test-service-account.json"),
);

export const projectId = projectConfig.projectId;
