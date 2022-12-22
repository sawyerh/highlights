import Image from "next/image";

const Cover = (props: {
	className?: string;
	authors?: Volume["authors"];
	image?: Volume["image"];
	title: Volume["title"];
	priority?: boolean;
}) => {
	const contents = props.image ? (
		<Image
			src={props.image}
			alt={props.title}
			priority={props.priority}
			fill
			sizes="(min-width: 600px) 200px, 150px"
		/>
	) : (
		<figcaption className="block aspect-cover bg-stone-800 p-4 text-white">
			<strong className="mb-1 block font-serif text-xl">{props.title}</strong>
			<span className="text-sm">
				{props.authors && props.authors.join(", ")}
			</span>
		</figcaption>
	);

	return (
		<figure className={`${props.className} relative aspect-cover`}>
			{contents}
		</figure>
	);
};

export default Cover;
