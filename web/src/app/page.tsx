import { getVolumes } from "api";
import CoverLink from "components/CoverLink";

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
						<CoverLink volume={volume} priority={index < 5} />
					</li>
				))}
			</ul>
		</main>
	);
};

export default Page;
