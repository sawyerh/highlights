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

type Importer = (mail: AWS.S3.Body) => Promise<{
	highlights: ParsedHighlight[];
	volume: ParsedVolume;
}>;
