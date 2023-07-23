"use client";

import { KeyReturn, MagnifyingGlass } from "@phosphor-icons/react";
import {
	QueryClient,
	QueryClientProvider,
	useQuery,
} from "@tanstack/react-query";
import classNames from "classnames";
import { motion } from "framer-motion";
import { request } from "helpers/request";
import useLockBodyScroll from "hooks/useLockBodyScroll";
import { ForwardedRef, forwardRef, useEffect, useRef, useState } from "react";
import { trackEvent } from "services/monitoring";

import styles from "./AI.module.css";
import Highlight from "./Highlight";

const queryClient = new QueryClient();

/**
 * Search result item
 */
function Result(props: { children: React.ReactNode }) {
	return <div className="mb-5 rounded-md bg-white p-5">{props.children}</div>;
}

/**
 * Show/Hide behavior of the dialog
 */
function useDialog(ref: React.MutableRefObject<HTMLDialogElement | null>) {
	const { lockBodyScroll, unlockBodyScroll } = useLockBodyScroll();

	const show = () => {
		ref.current?.showModal();
		lockBodyScroll();
		trackEvent("opened-ai-dialog");
	};

	const hide = () => {
		ref.current?.close();
		document.body.classList.remove("is-frozen");
		trackEvent("closed-ai-dialog");
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			if (ref.current?.open) {
				hide();
			} else {
				show();
			}
			trackEvent("used-cmd-k-shortcut");
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

const SearchDialog = forwardRef(function SearchDialog(
	props: {
		hide: () => void;
	},
	ref: ForwardedRef<HTMLDialogElement>,
) {
	const [query, setQuery] = useState<string>("");
	const [submittedQuery, setSubmittedQuery] = useState<string>("");
	const { isFetching, data: queryResults } = useQuery({
		queryKey: [submittedQuery],
		enabled: !!submittedQuery,
		queryFn: async () =>
			request<SearchResult[]>(`/api/search?query=${submittedQuery}`),
		refetchOnWindowFocus: false,
	});

	const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
		if (e.target === e.currentTarget) {
			props.hide();
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
			setSubmittedQuery(query.trim());
			trackEvent("submitted-search", { query_length: query.trim().length });
		}
	};

	return (
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
				{isFetching ? (
					<motion.div
						key="results-loader"
						animate={{
							opacity: 1,
							y: 0,
						}}
						exit={{ opacity: 0, y: -20 }}
						initial={{
							opacity: 0,
							y: -20,
						}}
					>
						<p className="text-shadow-sm text-white">Searching&hellip;</p>
					</motion.div>
				) : (
					<motion.div
						key="results"
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 20, opacity: 0 }}
						initial={{ y: 20, opacity: 0 }}
					>
						{queryResults?.map((result) => (
							<Result key={result.highlight_key}>
								<Highlight
									body={result.body}
									id={result.highlight_key}
									onLinkClick={props.hide}
								/>
							</Result>
						))}
					</motion.div>
				)}
			</div>
		</dialog>
	);
});

/**
 * Dialog for interacting with the AI features, like search and summarization.
 */
export default function AI() {
	const ref = useRef<HTMLDialogElement>(null);
	const { hide: hideDialog, show: showDialog } = useDialog(ref);

	return (
		<QueryClientProvider client={queryClient}>
			<button
				className="fixed right-1 top-1 rounded-sm p-2 text-neutral-500 hover:text-black"
				onClick={showDialog}
				title="Open search"
				type="button"
			>
				<MagnifyingGlass size={16} weight="bold" />
			</button>
			<SearchDialog ref={ref} hide={hideDialog} />
		</QueryClientProvider>
	);
}
