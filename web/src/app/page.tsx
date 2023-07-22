import Link from "next/link";

import { getVolumes } from "api";
import Cover from "components/Cover";

interface CoverLinkProps {
	priority: boolean;
	volume: Volume;
}

function CoverLink(props: CoverLinkProps) {
	const { priority, volume } = props;

	return (
		<Link className="cover-link" href={`/volumes/${volume.id}`}>
			<Cover
				authors={volume.authors}
				className="cover-link__cover mb-2"
				image={volume.image}
				priority={priority}
				title={volume.title}
			/>
			<h2 className="cover-link__text inline font-sans text-sm">
				{volume.title}
				{volume.format === "audiobook" && (
					<span title="Listened to this as an audiobook">&nbsp;🎧</span>
				)}
			</h2>
		</Link>
	);
}

const Page = async () => {
	const { volumes } = await getVolumes();

	return (
		<main className="mx-auto max-w-5xl px-4">
			<h1 className="my-16 font-serif text-4xl font-bold">
				What I&rsquo;ve been reading
			</h1>
			<ul className="grid-cols-volumes grid gap-8">
				{volumes.map((volume: Volume, index) => (
					<li key={volume.id} className="pb-4">
						<CoverLink priority={index < 10} volume={volume} />
					</li>
				))}
			</ul>
		</main>
	);
};

export default Page;
