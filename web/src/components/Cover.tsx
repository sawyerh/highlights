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
			alt={props.title}
			fill
			priority={props.priority}
			sizes="(min-width: 600px) 200px, 150px"
			src={props.image}
		/>
	) : (
		<figcaption className="aspect-cover block bg-stone-800 p-4 text-white">
			<strong className="mb-1 block font-serif text-xl">{props.title}</strong>
			<span className="text-sm">
				{props.authors && props.authors.join(", ")}
			</span>
		</figcaption>
	);

	return (
		<figure className={`${props.className} aspect-cover relative`}>
			{contents}
		</figure>
	);
};

export default Cover;
