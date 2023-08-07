"use client";

import Link from "next/link";

import { Robot } from "@phosphor-icons/react";
import {
	QueryClient,
	QueryClientProvider,
	useQuery,
} from "@tanstack/react-query";
import { request } from "helpers/request";
import { useEffect, useRef, useState } from "react";

const queryClient = new QueryClient();

interface Props {
	volumeId: string;
}

function SummarizeWithQueryClient(props: Props) {
	return (
		<QueryClientProvider client={queryClient}>
			<Summarize {...props} />
		</QueryClientProvider>
	);
}

function Summarize(props: Props) {
	const { volumeId } = props;
	const [showSummarize, setShowSummarize] = useState(false);
	const summaryRef = useRef<HTMLDivElement>(null);

	const { isFetching, data: summarizationResults } = useQuery({
		queryKey: [volumeId],
		enabled: !!showSummarize,
		queryFn: async () =>
			request<{ data: SummarizationResult[] }>(
				`${process.env.NEXT_PUBLIC_AI_CDN_URL}/summarize/${volumeId}`,
				{
					next: {
						revalidate: 60 * 60 * 24 * 7, // 1 week
					},
				},
			),
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (summaryRef.current) {
			summaryRef.current.scrollIntoView({
				behavior: "smooth",
			});
		}
	}, [summarizationResults]);

	if (summarizationResults) {
		return (
			<section
				ref={summaryRef}
				className="border-t-2 border-b-2 pt-9 pb-5 my-9 border-neutral-300"
			>
				<h2 className="text-xl font-bold mb-4 text-center flex items-center">
					<span className="text-yellow-600 inline-block mr-2">
						<Robot weight="duotone" />
					</span>{" "}
					Generated takeaways
				</h2>
				{summarizationResults.data.map((result, index) => {
					return (
						<div key={index} className="mb-4">
							{result.takeaway}
							{result.highlight_ids.map((highlightId, index) => (
								<sup key={highlightId}>
									<Link
										className="underline text-neutral-500 inline-block ml-1"
										href={`/highlights/${highlightId}`}
									>
										{index + 1}
									</Link>
								</sup>
							))}
						</div>
					);
				})}
			</section>
		);
	}

	return (
		<div className="text-center mb-10 lg:fixed lg:right-0 lg:bottom-0 lg:pb-2 lg:pr-2 lg:m-0">
			<button
				className="inline-flex bg-neutral-200 hover:bg-neutral-800 hover:text-white p-1 rounded-sm items-center text-xs"
				disabled={isFetching}
				onClick={() => setShowSummarize(true)}
				type="button"
			>
				<Robot className="mr-1" />
				{isFetching ? "Summarizing…" : "Summarize"}
			</button>
		</div>
	);
}

export default SummarizeWithQueryClient;
