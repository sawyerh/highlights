import { NextRequest, NextResponse } from "next/server";

import { request } from "helpers/request";

const AI_URL = process.env.AI_URL;

/**
 * Perform a search
 */
export async function GET(req: NextRequest) {
	const volume_id = req.nextUrl.searchParams.get("volume_id");

	if (!volume_id) {
		return NextResponse.json(
			{ error: "Missing volume_id parameter" },
			{ status: 400 },
		);
	}

	const { data } = await request<{ data: SummarizationResult[] }>(
		`${AI_URL}/summarize/${volume_id}`,
		{
			next: {
				revalidate: 60 * 60 * 24 * 7, // 1 week
			},
		},
	);

	return NextResponse.json(data);
}
