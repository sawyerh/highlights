import Highlight from "components/Highlight";
import Nav, { NavLink } from "components/Nav";
import VolumeHeader from "components/VolumeHeader";

import loader from "./loader";

const Page = async ({ params }: { params: { [key: string]: string } }) => {
	const { highlight, volume } = await loader(params);

	return (
		<>
			<Nav>
				<NavLink href={`/volumes/${volume.id}`}>{volume.title}</NavLink>
			</Nav>
			<main className="mx-auto max-w-2xl px-4">
				<VolumeHeader volume={volume} small />
				<Highlight highlight={highlight} />
			</main>
		</>
	);
};

export default Page;
