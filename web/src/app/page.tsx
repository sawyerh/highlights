import Link from "next/link";

import { getVolumes } from "api";
import Cover from "components/Cover";

const Page = async () => {
	const { volumes } = await getVolumes();

	return (
		<main className="mx-auto max-w-5xl px-4">
			<h1 className="my-16 font-serif text-4xl font-bold">
				What I&rsquo;ve been reading
			</h1>
			<ul className="grid grid-cols-volumes gap-8">
				{volumes.map((volume: Volume, index) => (
					<li className="pb-4" key={volume.id}>
						{/* prefetch="false" prevents loading right away, but still preloads when hovered */}
						<Link
							href={`/volumes/${volume.id}`}
							className="group"
							prefetch={false}
						>
							<Cover
								className="mb-2 transition-transform duration-300 group-hover:-translate-y-4 group-hover:rotate-2 group-hover:scale-105"
								authors={volume.authors}
								image={volume.image}
								title={volume.title}
								priority={index < 5}
							/>
							<h2 className="border-b-4 border-b-transparent pb-3 font-sans text-sm group-hover:border-b-black">
								{volume.title}
								{volume.format === "audiobook" && (
									<span title="Listened to this as an audiobook">&nbsp;🎧</span>
								)}
							</h2>
						</Link>
					</li>
				))}
			</ul>
		</main>
	);
};

export default Page;
