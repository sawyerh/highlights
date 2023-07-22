"use client";

import { KeyReturn, MagnifyingGlass } from "@phosphor-icons/react";
import classNames from "classnames";
import useLockBodyScroll from "hooks/useLockBodyScroll";
import { useEffect, useRef, useState } from "react";

import styles from "./AI.module.css";
import Highlight from "./Highlight";

/**
 * Search result item
 */
function Result(props: { children: React.ReactNode }) {
	return <div className="mb-5 rounded-md bg-white p-5">{props.children}</div>;
}

/**
 * Show/Hide behavior of the dialog
 */
function useDialog(ref: React.RefObject<HTMLDialogElement | null>) {
	const { lockBodyScroll, unlockBodyScroll } = useLockBodyScroll();

	const show = () => {
		ref.current?.showModal();
		lockBodyScroll();
	};

	const hide = () => {
		ref.current?.close();
		document.body.classList.remove("is-frozen");
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			if (ref.current?.open) return hide();
			show();
		}
	};

	useEffect(() => {
		document.addEventListener("keydown", handleKeydown);
		return () => document.removeEventListener("keydown", handleKeydown);
	}, [ref]);

	useEffect(() => {
		ref.current?.addEventListener("close", unlockBodyScroll);
		return () => ref.current?.removeEventListener("close", unlockBodyScroll);
	}, [ref, unlockBodyScroll]);

	return { hide, show };
}

/**
 * Dialog for interacting with the AI features, like search and summarization.
 */
export default function AI() {
	const ref = useRef<HTMLDialogElement>(null);
	const [query, setQuery] = useState<string>("");
	const { hide: hideDialog, show: showDialog } = useDialog(ref);

	const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
		if (e.target === e.currentTarget) {
			hideDialog();
		}
	};

	const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
	};

	const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		const form = e.currentTarget;
		const isValid = form.reportValidity();
		if (isValid) {
			e.preventDefault();
		}
	};

	return (
		<>
			<button
				className="fixed right-1 top-1 rounded-sm p-2 text-neutral-500 hover:text-black"
				onClick={showDialog}
				title="Open search"
				type="button"
			>
				<MagnifyingGlass size={16} weight="bold" />
			</button>

			<dialog
				ref={ref}
				className={`${styles.dialog} m-0 min-h-screen w-full max-w-none bg-transparent p-0`}
				onClick={handleDialogClick}
			>
				{/* Include some padding so the click-to-exit area isn't so close to other tap targets */}
				<div className="mx-auto my-8 max-w-2xl p-3">
					<form onSubmit={handleSearchSubmit}>
						<label
							className="text-shadow-sm mb-2 block font-bold text-white"
							htmlFor="search-query"
						>
							Search
						</label>
						<div className="relative">
							<input
								className="mb-5 w-full appearance-none rounded-md p-5 outline-offset-4 outline-yellow-400 focus-visible:outline focus-visible:outline-2"
								id="search-query"
								name="query"
								onChange={handleQueryChange}
								pattern=".*\S+.*" // At least one non-whitespace character
								required
								value={query}
							/>
							<button
								aria-label="Search"
								className={classNames(
									"absolute right-4 top-4 appearance-none p-0 outline-yellow-500 transition-colors hover:text-neutral-800 focus:text-neutral-800",
									{
										"text-neutral-200": query.trim().length === 0,
										"text-neutral-500": query.trim().length > 0,
									},
								)}
								type="submit"
							>
								<KeyReturn size={32} weight="fill" />
							</button>
						</div>
					</form>
					<Result>
						<Highlight body="This is a test highlight." id="test" />
					</Result>
					<Result>
						<Highlight body="This is a test highlight." id="test" />
					</Result>
				</div>
			</dialog>
		</>
	);
}
