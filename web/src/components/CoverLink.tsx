import Link from "next/link";

import Cover from "./Cover";

interface Props {
	priority: boolean;
	volume: Volume;
}

export default function CoverLink(props: Props) {
	const { priority, volume } = props;

	return (
		<Link href={`/volumes/${volume.id}`} className="cover-link">
			<Cover
				className="mb-2 cover-link__cover"
				authors={volume.authors}
				image={volume.image}
				title={volume.title}
				priority={priority}
			/>
			<h2 className="font-sans text-sm cover-link__text inline">
				{volume.title}
				{volume.format === "audiobook" && (
					<span title="Listened to this as an audiobook">&nbsp;🎧</span>
				)}
			</h2>
		</Link>
	);
}
