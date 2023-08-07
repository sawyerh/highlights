import { NextRequest, NextResponse } from "next/server";

import { request } from "helpers/request";

const AI_URL = process.env.NEXT_PUBLIC_AI_CDN_URL;

/**
 * Perform a search
 */
export async function GET(req: NextRequest) {
	const query = req.nextUrl.searchParams.get("query");

	if (!query) {
		return NextResponse.json(
			{ error: "Missing query parameter" },
			{ status: 400 },
		);
	} else if (query.length > 1000) {
		// Prevent excessively long queries
		return NextResponse.json({ error: "Sawyer says No" }, { status: 400 });
	}

	const { data } = await request<{ data: SearchResult[] }>(
		`${AI_URL}/search?query=${query}`,
		{
			next: {
				revalidate: 60 * 60 * 24, // 24 hours
			},
		},
	);
	return NextResponse.json(data);
}
