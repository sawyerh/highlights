import { getFirestore } from "firebase-admin/firestore";
import { ObjectMetadata } from "firebase-functions/v1/storage";

/**
 * Clear the `image` prop from the volume
 */
function resetVolumeImage(key: string) {
	const db = getFirestore();

	return db
		.collection("volumes")
		.where("image", "==", key)
		.limit(1)
		.get()
		.then((querySnap) => {
			return Promise.all(
				querySnap.docs.map((volume) => {
					volume.ref.update({ image: null });
				}),
			);
		});
}

function handleStorageObjectDelete(object: ObjectMetadata) {
	const key = object.name;
	console.log("handleStorageObjectDelete for key: ", key);

	if (key && key.startsWith("volume/covers/")) {
		return resetVolumeImage(key);
	}

	return null;
}

export default handleStorageObjectDelete;
