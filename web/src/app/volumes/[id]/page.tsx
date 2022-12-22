import Highlight from "components/Highlight";
import Nav from "components/Nav";
import VolumeHeader from "components/VolumeHeader";

import loader from "./loader";

const Page = async ({ params }: { params: { [key: string]: string } }) => {
	const { highlights, volume } = await loader(params);

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
