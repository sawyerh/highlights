"use client";

import useLockBodyScroll from "hooks/useLockBodyScroll";
import { useEffect, useRef } from "react";

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
}

/**
 * Dialog for interacting with the AI features, like search and summarization.
 */
export default function AI() {
	const ref = useRef<HTMLDialogElement>(null);
	useDialog(ref);

	const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
	};

	return (
		<dialog
			className={`${styles.dialog} m-0 max-h-full w-full max-w-none bg-transparent p-0`}
			ref={ref}
		>
			<div className="mx-auto w-5/6 max-w-2xl px-8 pt-8">
				<form onSubmit={handleSearchSubmit}>
					<label
						htmlFor="search-query"
						className="mb-2 block font-bold text-white"
					>
						Search
					</label>
					<input
						name="query"
						id="search-query"
						className="mb-5 w-full appearance-none rounded-md p-5 outline-offset-4 outline-yellow-400 focus-visible:outline focus-visible:outline-2"
					/>
				</form>
				<Result>
					<Highlight body="This is a test highlight." id="test" />
				</Result>
			</div>
		</dialog>
	);
}
