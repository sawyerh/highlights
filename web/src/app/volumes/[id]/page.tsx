import { getHighlights, getVolume } from "api";
import Highlight from "components/Highlight";
import Nav from "components/Nav";
import VolumeHeader from "components/VolumeHeader";
import seoTitleForVolume from "helpers/seoTitleForVolume";

async function loader(params: PageParams) {
	const volume = await getVolume(params.id);
	const { highlights } = await getHighlights(params.id);

	return {
		volume,
		highlights,
	};
}

export async function generateMetadata({ params }: { params: PageParams }) {
	const { volume } = await loader(params);

	return {
		title: seoTitleForVolume(volume),
		description: `Sawyer's highlights from ${volume.title}`,
	};
}

function AIMode({
	highlights,
	volume,
}: {
	highlights: Highlight[];
	volume: Volume;
}) {
	const combinedHighlights = highlights
		.map((highlight) => `[Location: ${highlight.location}] ${highlight.body}`)
		.join("\n---\n");

	const text = `###
Volume:
${volume.title} ${
		volume.subtitle ? `- ${volume.subtitle}` : ""
	}, by ${volume.authors?.join(", ")}

Highlights:
---
${combinedHighlights}`;

	return <textarea className="w-full min-h-[95vh] p-4" value={text} />;
}

/**
 * CSV file format for use in the Cohere playground
 * https://dashboard.cohere.ai/playground/embed
 */
function CohereCSVMode({ highlights }: { highlights: Highlight[] }) {
	const text = highlights
		.map((highlight) => {
			return highlight.body.replace(/,/g, "\\,");
		})
		.join("\n");

	return (
		<textarea className="w-full min-h-[95vh] p-4" value={`examples\n${text}`} />
	);
}

const Page = async ({
	params,
	searchParams,
}: {
	params: PageParams;
	searchParams: PageParams;
}) => {
	const { highlights, volume } = await loader(params);

	if (searchParams.mode === "ai") {
		return <AIMode highlights={highlights} volume={volume} />;
	}

	if (searchParams.mode === "cohere-csv") {
		return <CohereCSVMode highlights={highlights} />;
	}

	return (
		<>
			<Nav />
			<main className="mx-auto max-w-2xl px-4">
				<VolumeHeader volume={volume} />
				{highlights.length === 0 && (
					<p className="text-center">
						{volume.format === "audiobook"
							? "I listened to this as an audiobook."
							: "No notes yet for this."}
					</p>
				)}
				{highlights.map((highlight) => (
					<Highlight key={highlight.id} highlight={highlight} />
				))}
			</main>
		</>
	);
};

export default Page;
