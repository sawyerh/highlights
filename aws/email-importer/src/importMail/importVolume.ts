import { getFirestore, Timestamp } from "firebase-admin/firestore";

async function create(props: {
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

function findByImportTitle(title: string) {
	const db = getFirestore();
	return db.collection("volumes").where("importTitle", "==", title).get();
}

export async function importVolume(props: {
	title: string;
	authors: string[];
	highlightsCount: number;
}) {
	const snapshot = await findByImportTitle(props.title);
	if (snapshot.empty) {
		return create(props);
	}
	const ref = snapshot.docs[0].ref;
	console.log("Found existing Volume", ref.id);
	return ref;
}
