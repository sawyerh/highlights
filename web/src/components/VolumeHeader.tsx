import classnames from "classnames";

import Cover from "./Cover";

const VolumeHeader = (props: { small?: boolean; volume: Volume }) => {
	const { volume } = props;

	return (
		<header className="mb-12">
			{volume.image && (
				<Cover
					authors={volume.authors}
					className={classnames("max-w-cover-sm mx-auto mb-6", {
						"sm:max-w-cover": !props.small,
					})}
					image={volume.image}
					priority
					title={volume.title}
				/>
			)}

			<div className="mb-4">
				<h1 className="text-center font-serif text-2xl font-bold sm:text-3xl">
					{volume.title}
				</h1>
				{volume.subtitle && (
					<h2 className="text-center font-serif text-2xl font-normal italic antialiased dark:text-stone-400">
						{volume.subtitle}
					</h2>
				)}
			</div>

			{volume.authors && (
				<p className="text-center">{volume.authors.join(", ")}</p>
			)}
		</header>
	);
};

export default VolumeHeader;
