import Link from "next/link";

import Cover from "./Cover";

interface Props {
	priority: boolean;
	volume: Volume;
}

export default function CoverLink(props: Props) {
	const { priority, volume } = props;

	return (
		<Link className="cover-link" href={`/volumes/${volume.id}`}>
			<Cover
				authors={volume.authors}
				className="mb-2 cover-link__cover"
				image={volume.image}
				priority={priority}
				title={volume.title}
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
