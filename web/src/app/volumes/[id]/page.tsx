import { getHighlights, getVolume } from "api";
import Highlight from "components/Highlight";
import Nav from "components/Nav";
import VolumeHeader from "components/VolumeHeader";
import seoTitleForVolume from "helpers/seoTitleForVolume";
import { Suspense } from "react";

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
			{highlights.map((highlight) => (
				<Highlight key={highlight.id} {...highlight} />
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
					<HighlightsFeed volumeId={volume.id} format={volume.format} />
				</Suspense>
			</main>
		</>
	);
};

export default Page;
