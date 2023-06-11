import { Source } from "mailparser";

interface KindleEmailHighlight {
	color?: string;
	content: string;
	location?: string;
	notes?: {
		content: string;
		location?: string;
	};
}

interface KindleEmailData {
	highlights: KindleEmailHighlight[];
	volume: {
		authors: string[];
		title: string;
	};
}

declare function toJSON(source: Source): Promise<KindleEmailData>;

export = toJSON;
