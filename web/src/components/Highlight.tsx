import Link from "next/link";

const Highlight = (props: { highlight: Highlight }) => {
	const { highlight } = props;

	return (
		<article className="mb-12">
			<blockquote className="text-md mb-2 font-serif leading-relaxed sm:text-lg sm:leading-relaxed">
				<mark>{highlight.body}</mark>
			</blockquote>
			<Link
				className="text-sm text-slate-600 hover:underline"
				href={`/highlights/${highlight.id}`}
				prefetch={false}
				title="Open highlight permalink"
			>
				{highlight.location} ↱
			</Link>
		</article>
	);
};

export default Highlight;
