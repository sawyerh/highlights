const Highlight = (props: { highlight: Highlight }) => {
	const { highlight } = props;

	return (
		<article className="mb-12">
			<blockquote className="text-md mb-2 font-serif leading-relaxed sm:text-lg sm:leading-relaxed">
				<mark className="bg-highlight text-black">{highlight.body}</mark>
			</blockquote>
			<a
				href={`/highlights/${highlight.id}`}
				className="text-sm text-slate-600 hover:underline"
				title="Open highlight permalink"
			>
				{highlight.location} ↱
			</a>
		</article>
	);
};

export default Highlight;
