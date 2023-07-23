"use client";

import { useState } from "react";

export default function useLockBodyScroll() {
	const [scrollY, setScrollY] = useState(0);

	const lockBodyScroll = () => {
		const _scrollY = window.scrollY;
		setScrollY(_scrollY);

		document.body.classList.add("is-locked");
		document.body.style.top = `-${_scrollY}px`;
	};

	const unlockBodyScroll = () => {
		document.body.classList.remove("is-locked");
		window.scrollTo(0, scrollY);
	};

	return { lockBodyScroll, unlockBodyScroll };
}
