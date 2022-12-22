import { getHighlights, getVolume } from "api";

export default async function loader(params: { [key: string]: string }) {
	const volume = await getVolume(params.id);
	const { highlights } = await getHighlights(params.id);

	return {
		volume,
		highlights,
	};
}
