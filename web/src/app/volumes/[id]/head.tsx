import seoTitleForVolume from "helpers/seoTitleForVolume";

import loader from "./loader";

export default async function Head({
	params,
}: {
	params: { [key: string]: string };
}) {
	const { volume } = await loader(params);

	return (
		<>
			<title>{seoTitleForVolume(volume)}</title>
			<meta
				name="description"
				content={`Sawyer's highlights from ${volume.title}`}
			/>
		</>
	);
}
