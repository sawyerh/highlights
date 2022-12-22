import seoTitleForVolume from "helpers/seoTitleForVolume";

import loader from "./loader";

export default async function Head({
	params,
}: {
	params: { [key: string]: string };
}) {
	const { highlight, volume } = await loader(params);

	return (
		<>
			<title>{seoTitleForVolume(volume)}</title>
			<meta
				name="description"
				content={`A highlight from: ${volume.title} 📄 ${
					highlight.location ?? ""
				} }}`}
			/>
		</>
	);
}
