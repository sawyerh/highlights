import { getHighlight, getVolume } from "api";

export default async function loader(params: { [key: string]: string }) {
	const highlight = await getHighlight(params.id);
	const volume = await getVolume(highlight.volume);

	return {
		volume,
		highlight,
	};
}
