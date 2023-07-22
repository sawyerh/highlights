import { getHighlight, getVolume } from "api";
import Highlight from "components/Highlight";
import Nav, { NavLink } from "components/Nav";
import VolumeHeader from "components/VolumeHeader";
import seoTitleForVolume from "helpers/seoTitleForVolume";

async function loader(params: PageParams) {
	const highlight = await getHighlight(params.id);
	const volume = await getVolume(highlight.volume);

	return {
		volume,
		highlight,
	};
}

export async function generateMetadata({ params }: { params: PageParams }) {
	const { highlight, volume } = await loader(params);

	return {
		title: seoTitleForVolume(volume),
		description: `A highlight from: ${volume.title} 📄 ${
			highlight.location ?? ""
		}`,
	};
}

const Page = async ({ params }: { params: PageParams }) => {
	const { highlight, volume } = await loader(params);

	return (
		<>
			<Nav>
				<NavLink href={`/volumes/${volume.id}`}>{volume.title}</NavLink>
			</Nav>
			<main className="mx-auto max-w-2xl px-4">
				<VolumeHeader small volume={volume} />
				<Highlight highlight={highlight} />
			</main>
		</>
	);
};

export default Page;
