import { NextRequest, NextResponse } from "next/server";

import { search } from "api";

export async function GET(request: NextRequest) {
	const query = request.nextUrl.searchParams.get("query");

	if (!query) {
		return NextResponse.json(
			{ error: "Missing query parameter" },
			{ status: 400 },
		);
	}

	const results = await search(query);
	return NextResponse.json(results);
}
