import { getVolumes } from "api";
import CoverLink from "components/CoverLink";

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
