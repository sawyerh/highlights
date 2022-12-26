import fetch from "node-fetch";

import firebase from "../firebase.json";

export default async function cleanup(projectId: string) {
	// Clear the emulator database
	// https://firebase.google.com/docs/emulator-suite/connect_firestore#clear_your_database_between_tests
	await fetch(
		`http://localhost:${firebase.emulators.firestore.port}/emulator/v1/projects/${projectId}/databases/(default)/documents`,
		{
			method: "DELETE",
		},
	);
}
