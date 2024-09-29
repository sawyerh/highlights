import textToJSON from "highlights-email-to-json";
import kindleClippingsToJSON from "kindle-clippings-to-json";
import kindleEmailToJSON from "kindle-email-to-json";
import safariEmailToJSON from "safari-books-csv-to-json";

export interface ParsedHighlight {
	content: string;
	[key: string]: unknown;
}

export interface ParsedHighlightWithHash extends ParsedHighlight {
	hash: number;
}

export interface ParsedVolume {
	authors: string[];
	title: string;
}

export type ParserFn = (mail: string) => Promise<{
	highlights: ParsedHighlight[];
	volume?: ParsedVolume;
}>;

const parsers: ParserFn[] = [
	kindleEmailToJSON,
	safariEmailToJSON,
	kindleClippingsToJSON,
	textToJSON,
];

/**
 * Run all parsers on the email body until one finds highlights
 */
export async function getHighlightsAndVolumeFromEmail(email: string) {
	let highlights: ParsedHighlight[] = [];
	let volume: ParsedVolume | undefined;

	for await (const parser of parsers) {
		try {
			const results = await parser(email);
			if (results.volume) {
				// Some exports may only have a volume
				volume = results.volume;
			}
			if (results.highlights.length) {
				highlights = results.highlights;
				// Once we've found highlights, we don't need to try other parsers
				break;
			}
		} catch (error) {
			// Parsers reject when nothing was found
			if (error instanceof Error) console.log(error.message);
		}
	}

	return { highlights, volume };
}
