export default function seoTitleForVolume(volume: Volume) {
	const parts = [volume.title];
	if (volume.subtitle) parts.push(`: ${volume.subtitle}`);
	if (volume.authors?.length) parts.push(` ✍️ by ${volume.authors.join(", ")}`);

	return parts.join("");
}
