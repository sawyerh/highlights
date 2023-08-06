import type { GetObjectCommandOutput } from "@aws-sdk/client-s3";

interface ParsedHighlight {
	content: string;
	[key: string]: unknown;
}

interface ParsedHighlightWithHash extends ParsedHighlight {
	hash: number;
}

interface ParsedVolume {
	authors: string[];
	title: string;
}

type Importer = (mail: GetObjectCommandOutput["Body"]) => Promise<{
	highlights: ParsedHighlight[];
	volume: ParsedVolume;
}>;
