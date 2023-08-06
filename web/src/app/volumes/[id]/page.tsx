import { getHighlights, getVolume } from "api";
import Highlight from "components/Highlight";
import Nav from "components/Nav";
import VolumeHeader from "components/VolumeHeader";
import seoTitleForVolume from "helpers/seoTitleForVolume";
import { Suspense } from "react";

import Summarize from "./Summarize";

export async function generateMetadata({ params }: { params: PageParams }) {
	const volume = await getVolume(params.id);

	return {
		title: seoTitleForVolume(volume),
		description: `Sawyer's highlights from ${volume.title}`,
	};
}

const HighlightsFeed = async (props: {
	volumeId: string;
	format: Volume["format"];
}) => {
	const highlights = await getHighlights(props.volumeId);

	return (
		<>
			{highlights.length === 0 && (
				<p className="text-center">
					{props.format === "audiobook"
						? "I listened to this as an audiobook."
						: "No notes yet for this."}
				</p>
			)}
			{highlights.length > 10 && <Summarize volumeId={props.volumeId} />}
			{highlights.map((highlight) => (
				<Highlight key={highlight.id} className="mb-12" {...highlight} />
			))}
		</>
	);
};

const Page = async ({ params }: { params: PageParams }) => {
	const volume = await getVolume(params.id);

	return (
		<>
			<Nav />
			<main className="mx-auto max-w-2xl px-4">
				<VolumeHeader volume={volume} />
				<Suspense
					fallback={<p className="text-center">Loading highlights&hellip;</p>}
				>
					<HighlightsFeed format={volume.format} volumeId={volume.id} />
				</Suspense>
			</main>
		</>
	);
};

export default Page;
