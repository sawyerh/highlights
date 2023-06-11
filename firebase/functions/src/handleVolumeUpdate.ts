import {
	DocumentReference,
	getFirestore,
	QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { Change } from "firebase-functions/v2";

import handleVolumeCreate from "./handleVolumeCreate";

/**
 * Update all highlights of a volume to match the volume's visibility
 */
function updateHighlightsVisibility(
	visible: boolean | undefined,
	volumeRef: DocumentReference,
) {
	const db = getFirestore();

	return db
		.collection("highlights")
		.where("volume", "==", volumeRef)
		.get()
		.then((results) => {
			if (results.empty) {
				return console.log(
					"No highlights to update for volume: ",
					volumeRef.id,
				);
			}

			const batch = db.batch();

			results.forEach((highlight) =>
				batch.update(highlight.ref, {
					visible: visible,
				}),
			);

			return batch.commit().then(() => {
				console.log(
					`Visibility of ${results.size} highlights updated to: `,
					visible,
				);
			});
		});
}

function handleVolumeUpdate(snap: Change<QueryDocumentSnapshot>) {
	const ref = snap.after.ref;
	const volume = snap.after.data() as Volume; // after the update
	const prevVolume = snap.before.data() as Volume; // before the update

	console.log("handleVolumeUpdate", ref.id, volume.title);

	if (volume.visible !== prevVolume.visible) {
		return updateHighlightsVisibility(volume.visible, ref);
	}

	// Attempt to refetch Google Book data
	if (!volume.googleBook) {
		handleVolumeCreate(snap.after);
	}

	return null;
}

export default handleVolumeUpdate;
