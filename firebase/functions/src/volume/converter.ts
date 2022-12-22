import { FirestoreDataConverter } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const converter: FirestoreDataConverter<Volume> = {
	fromFirestore: (snapshot: FirebaseFirestore.QueryDocumentSnapshot) => {
		const data = snapshot.data();
		const imageStoragePath = data.image;

		if (imageStoragePath) {
			const bucket = getStorage().bucket();
			const file = bucket.file(imageStoragePath);
			// This depends on makePublic() to have been called on the file at some point prior to this.
			// The converter can't be async, so we can't call that (or isPublic) here.
			data.image = file.publicUrl();
		}

		return {
			authors: data.authors,
			createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
			format: data.format,
			id: snapshot.id,
			image: data.image,
			subtitle: data.subtitle,
			title: data.title,
			visible: data.visible,
		};
	},
	toFirestore: (data) => {
		return data;
	},
};

export default converter;
