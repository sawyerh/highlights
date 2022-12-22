import classnames from "classnames";

import Cover from "./Cover";

const VolumeHeader = (props: { small?: boolean; volume: Volume }) => {
	const { volume } = props;

	return (
		<header className="mb-12">
			{volume.image && (
				<Cover
					className={classnames("mx-auto mb-6 max-w-cover-sm", {
						"sm:max-w-cover": !props.small,
					})}
					authors={volume.authors}
					image={volume.image}
					title={volume.title}
					priority
				/>
			)}

			<div className="mb-4">
				<h1 className="text-center font-serif text-2xl font-bold sm:text-3xl">
					{volume.title}
				</h1>
				{volume.subtitle && (
					<h2 className="text-center font-serif text-2xl font-normal italic antialiased">
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
