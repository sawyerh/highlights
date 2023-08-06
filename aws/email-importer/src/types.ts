import type { GetObjectCommandOutput } from "@aws-sdk/client-s3";

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

export type Importer = (mail: GetObjectCommandOutput["Body"]) => Promise<{
	highlights: ParsedHighlight[];
	volume: ParsedVolume;
}>;
