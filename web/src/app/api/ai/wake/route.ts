import { NextResponse } from "next/server";

import { request } from "helpers/request";

const AI_URL = process.env.NEXT_PUBLIC_AI_CDN_URL;

/**
 * The API is a serverless function, and benefits from being "warmed up" before
 * a real request comes in.
 */
export async function PUT() {
	await request(`${AI_URL}/wake}`, {
		next: {
			revalidate: 60 * 30, // 30 minutes
		},
	});
	return NextResponse.json({});
}
