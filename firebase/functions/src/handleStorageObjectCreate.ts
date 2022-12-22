import { getStorage } from "firebase-admin/storage";
import type functions from "firebase-functions";

/**
 * Make new cover images public so that publicUrl works in the web app
 */
async function handleStorageObjectCreate(
	object: functions.storage.ObjectMetadata,
) {
	const key = object.name;
	console.log("handleStorageObjectCreate", key);
	if (!key || !key.startsWith("volume/covers/")) return null;

	const storage = getStorage();
	const bucket = storage.bucket();
	const file = bucket.file(key);

	await file.makePublic();
}

export default handleStorageObjectCreate;
