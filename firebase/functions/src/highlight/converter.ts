import { FirestoreDataConverter } from "firebase-admin/firestore";

const converter: FirestoreDataConverter<Highlight> = {
	fromFirestore: (snapshot: FirebaseFirestore.QueryDocumentSnapshot) => {
		const data = snapshot.data();

		return {
			id: snapshot.id,
			body: data.body,
			location: data.location,
			volume: data.volume ? data.volume.id : undefined,
		};
	},
	toFirestore: (data) => {
		return data;
	},
};

export default converter;
