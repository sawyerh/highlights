import {
	DocumentReference,
	QueryDocumentSnapshot,
	getFirestore,
} from "firebase-admin/firestore";

import language from "@google-cloud/language";

import initHighlight from "@sawyerh/firestore-highlights/Highlight";

function annotateText(text: string) {
	const client = new language.LanguageServiceClient();

	return client.annotateText({
		document: {
			content: text,
			type: "PLAIN_TEXT",
		},
		features: {
			classifyText: true,
			extractDocumentSentiment: true,
			extractEntities: true,
			extractEntitySentiment: false,
		},
		encodingType: "UTF8",
	});
}

async function updateWithAnnotation(
	ref: DocumentReference,
	results: Awaited<ReturnType<typeof annotateText>>,
) {
	const db = getFirestore();
	const Highlight = initHighlight(db);

	const response = results[0];
	const categories = response.categories;
	const documentSentiment = response.documentSentiment;

	delete response.categories;
	delete response.documentSentiment;

	const data = {
		categories: categories,
		documentSentiment: documentSentiment,
		languageAnalysis: response,
		indexCategories: Highlight.indexCategories(categories),
		indexEntities: null,
	};

	data.indexEntities = Highlight.indexEntities(Highlight.properEntities(data));

	return ref.update(data);
}

/**
 * Run a highlight's body through Google's Natural Language API to retrieve
 * the sentiment analysis, entities, and classification
 */
async function handleHighlightCreate(snap: QueryDocumentSnapshot) {
	const data = snap.data();

	if (data.languageAnalysis) return;

	try {
		const results = await annotateText(data.body);
		await updateWithAnnotation(snap.ref, results);
		console.log(`handleHighlightCreate completed for ${snap.ref.path}`);
	} catch (error) {
		console.error(error);
	}
}

export default handleHighlightCreate;
