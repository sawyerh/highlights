import Link from "next/link";

import classNames from "classnames";
import React from "react";

export const NavLink = (props: {
	href: string;
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<Link
			className={classNames(
				"inline-block px-2 py-2 text-blue-500 underline hover:text-blue-900",
				props.className,
			)}
			href={props.href}
		>
			{props.children}
		</Link>
	);
};

const Nav = (props: {
	/** NavLink */
	children?: React.ReactNode;
}) => {
	// Create a breadcrumb UI for any children links passed through
	const children = React.Children.map(props.children, (child) => {
		if (React.isValidElement(child)) {
			return (
				<>
					<span className="mx-2 inline-block">&gt;</span>
					{child}
				</>
			);
		}

		return child;
	});

	return (
		// Right padding to account for the fixed search icon
		<nav className="mb-12 border-b bg-white pr-10 text-sm leading-relaxed">
			<NavLink href="/">All</NavLink>
			{children}
		</nav>
	);
};

export default Nav;
