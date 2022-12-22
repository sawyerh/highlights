import fetch from "node-fetch";

import tester, { projectId } from "./_tester";

export default async function cleanup() {
	// Clear the emulator database
	// https://firebase.google.com/docs/emulator-suite/connect_firestore#clear_your_database_between_tests
	await fetch(
		`http://localhost:8080/emulator/v1/projects/${projectId}/databases/(default)/documents`,
		{
			method: "DELETE",
		},
	);

	tester.cleanup();
}
