import Link from "next/link";

const Highlight = (props: {
	body: Highlight["body"];
	id: Highlight["id"];
	location?: Highlight["location"];
	className?: string;
}) => {
	return (
		<article className={props.className}>
			<blockquote className="text-md mb-2 font-serif leading-relaxed sm:text-lg sm:leading-relaxed">
				<mark>{props.body}</mark>
			</blockquote>
			<Link
				href={`/highlights/${props.id}`}
				className="text-sm text-slate-600 hover:underline"
				title="Open highlight permalink"
				prefetch={false}
			>
				{props.location} ↱
			</Link>
		</article>
	);
};

export default Highlight;
