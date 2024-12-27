import Link from "next/link";

const Highlight = (props: {
	body: Highlight["body"];
	id: Highlight["id"];
	location?: Highlight["location"];
	className?: string;
	onLinkClick?: () => void;
}) => {
	return (
		<article className={props.className}>
			<blockquote className="text-md mb-2 font-serif leading-relaxed sm:text-lg sm:leading-relaxed">
				<mark>{props.body}</mark>
			</blockquote>
			<Link
				className="text-sm text-slate-600 dark:text-stone-400 hover:underline"
				href={`/highlights/${props.id}`}
				onClick={props.onLinkClick}
				prefetch={false}
				title="Open highlight permalink"
			>
				{props.location} ↱
			</Link>
		</article>
	);
};

export default Highlight;
