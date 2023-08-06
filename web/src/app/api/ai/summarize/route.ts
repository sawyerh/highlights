import { NextRequest, NextResponse } from "next/server";

import { request } from "helpers/request";

const AI_URL = process.env.AI_URL;

/**
 * Perform a search
 */
export async function GET(req: NextRequest) {
	const volume_id = req.nextUrl.searchParams.get("volume_id");
	// Vercel free plan has a 10 second max timeout, which is shorter
	// than what this endpoint takes to run sometimes. So we allow
	// passing this parameter to hit the endpoint without waiting for
	// it to finish, as a way to pre-warm the endpoint.
	const quick_exit = req.nextUrl.searchParams.get("quick_exit");

	if (!volume_id) {
		return NextResponse.json(
			{ error: "Missing volume_id parameter" },
			{ status: 400 },
		);
	}

	const requestPromise = request<{ data: SummarizationResult[] }>(
		`${AI_URL}/summarize/${volume_id}`,
		{
			next: {
				revalidate: 60 * 60 * 24 * 7, // 1 week
			},
		},
	);

	if (quick_exit) {
		return NextResponse.json([]);
	}

	const { data } = await requestPromise;

	return NextResponse.json(data);
}
