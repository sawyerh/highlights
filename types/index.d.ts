interface Highlight {
	id: string;
	body: string;
	location?: number | string;
	volume: string; // (e.g. "8w4eEAAAQBAJ")
}

/**
 * https://developers.google.com/books/docs/v1/reference/volumes#resource
 */
interface GoogleBook {
	kind: "books#volume";
	id: string;
	etag: string;
	selfLink: string;
}

interface IndustryIdentifier {
	type: "ISBN_10" | "ISBN_13";
	identifier: string;
}

interface SearchResult {
	body: string;
	highlight_key: string;
	volume_key: string;
	volume_title: string;
	volume_subtitle?: string;
}

interface Volume {
	authors?: string[];
	categories?: string[];
	createdAt: string;
	/**
	 * Populated (at least initially) by Google Books API
	 */
	description?: string;
	format?: "audiobook" | "ebook" | "paper";
	googleBook?: GoogleBook;
	id: string;
	/**
	 * Book cover image
	 */
	image?: string;
	industryIdentifiers?: IndustryIdentifier[];
	pageCount?: number;
	/**
	 * @example http://books.google.com/books?id=8w4eEAAAQBAJ&hl=&source=gbs_api
	 */
	previewLink?: string;
	/**
	 * @example "2018-01-02"
	 */
	publishedDate?: string;
	publisher?: string;
	subtitle?: string;
	title: string;
	visible?: boolean;
}
