"use client";

import { useEffect, useRef } from "react";

import styles from "./AI.module.css";

/**
 * Dialog for interacting with the AI features, like search and summarization.
 */
export default function AI() {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const dialog = dialogRef.current;

	const handleKeydown = (e: KeyboardEvent) => {
		if (!dialog) return;

		if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			if (dialog.open) return dialog.close();
			dialog.showModal();
		}
	};

	useEffect(() => {
		document.addEventListener("keydown", handleKeydown);
		return () => document.removeEventListener("keydown", handleKeydown);
	}, [dialog]);

	return (
		<dialog className={styles.dialog} ref={dialogRef}>
			TODO
		</dialog>
	);
}
