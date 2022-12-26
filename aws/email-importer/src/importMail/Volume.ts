import { Timestamp, getFirestore } from "firebase-admin/firestore";

class LambdaVolume {
	static async create(props: {
		title: string;
		authors: string[];
		highlightsCount: number;
	}) {
		const db = getFirestore();
		const ref = await db.collection("volumes").add({
			authors: props.authors,
			createdAt: Timestamp.now(),
			highlightsCount: props.highlightsCount,
			importTitle: props.title,
			title: props.title,
			visible: true,
		});
		console.log("Created Volume", ref.id);
		return ref;
	}

	static findByImportTitle(title: string) {
		const db = getFirestore();
		return db.collection("volumes").where("importTitle", "==", title).get();
	}

	static async findOrCreate(props: {
		title: string;
		authors: string[];
		highlightsCount: number;
	}) {
		const snapshot = await this.findByImportTitle(props.title);
		if (snapshot.empty) {
			return this.create(props);
		}
		const ref = snapshot.docs[0].ref;
		console.log("Found existing Volume", ref.id);
		return ref;
	}
}

export default LambdaVolume;
