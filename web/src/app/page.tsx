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
		<Link href={`/volumes/${volume.id}`} className="cover-link">
			<Cover
				className="cover-link__cover mb-2"
				authors={volume.authors}
				image={volume.image}
				title={volume.title}
				priority={priority}
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
					<li className="pb-4" key={volume.id}>
						<CoverLink volume={volume} priority={index < 10} />
					</li>
				))}
			</ul>
		</main>
	);
};

export default Page;
