import { DocumentData } from "firebase-admin/firestore";

import _ from "lodash";

interface Result {
	volumeInfo: {
		subtitle?: GoogleBooksApiVolume["volumeInfo"]["subtitle"];
		title: GoogleBooksApiVolume["volumeInfo"]["title"];
		authors?: GoogleBooksApiVolume["volumeInfo"]["authors"];
	};
}

/**
 * Ensure a result returned by Google Books is actually
 * the book we're looking for. By default, the API returns
 * results sorted by relevancy, so we only look at the first
 * result it returns. This method is important, because sometimes
 * a volume we save is a webpage, which won't be found in Google Books.
 * @return True if we're confident the result is accurate
 */
function confidentInResult(volume: DocumentData, result: Result): boolean {
	const authorIsSimilar = similarAuthor(volume, result);
	const titleSimilarityVal = titleSimilarity(volume, result);

	if (authorIsSimilar) {
		return titleSimilarityVal >= 0.5;
	}

	return titleSimilarityVal >= 0.8;
}

/**
 * Break the author names into specific words (ie. First/Last name)
 * The Google Books API returns author names formatted as "First Last"
 * but we sometimes store their name as "Last, First" or even
 * "First Last; First Last"
 */
function similarAuthor(volume: DocumentData, result: Result): boolean {
	if (!volume.authors || !result.volumeInfo.authors) return false;
	const authorWords = _.words(volume.authors.join(" ").toLowerCase());
	const resultAuthor = result.volumeInfo.authors.join(" ").toLowerCase();

	// Do the authors returned by Books API match any part of the authors we have?
	return authorWords.some((part) => resultAuthor.includes(part));
}

/**
 * Books API returns a title and subtitle field, whereas when we import
 * the Volume, we include everything within a title field. We use the
 * title similarity as an input into our confidence
 * @returns Between 0-1
 */
function titleSimilarity(volume: DocumentData, result: Result): number {
	const title = volume.title.toLowerCase();
	const titleWords = _.words(title);
	const resultTitle = result.volumeInfo.subtitle
		? `${result.volumeInfo.title} ${result.volumeInfo.subtitle}`.toLowerCase()
		: result.volumeInfo.title.toLowerCase();
	const titleMatches = resultTitle.includes(title);

	if (titleMatches) {
		return 1;
	}

	// Does the title returned include at least 70% of our title?
	// This is probably not the smartest solution /shrug
	const matchingWords = titleWords.filter((word) => resultTitle.includes(word));
	return matchingWords.length / titleWords.length;
}

export default confidentInResult;
