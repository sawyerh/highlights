import { Metadata } from "next";
import dynamic from "next/dynamic";
import { IBM_Plex_Mono, Noto_Serif } from "next/font/google";

import "styles/globals.css";

const AI = dynamic(() => import("components/AI"));

import Script from "next/script";

const fontSerif = Noto_Serif({
	weight: ["400", "700"],
	style: ["italic", "normal"],
	subsets: ["latin"],
	// For Tailwind:
	variable: "--font-noto-serif",
});

const fontSans = IBM_Plex_Mono({
	weight: ["400"],
	style: ["normal"],
	subsets: ["latin"],
	// For Tailwind:
	variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
	title: "Sawyer's Reading Highlights",
	description: "A collection of highlights and notes from books and articles.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<meta content="width=device-width, initial-scale=1" name="viewport" />
				<link href="/favicon.png" rel="SHORTCUT ICON" />
				<Script
					async
					src="https://www.googletagmanager.com/gtag/js?id=G-ZP11FFWXRN"
				></Script>
				<Script id="ga">
					{`window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());
					gtag('config', 'G-ZP11FFWXRN');`}
				</Script>
			</head>
			<body className={`${fontSerif.variable} ${fontSans.variable} font-sans`}>
				{children}
				<AI />
			</body>
		</html>
	);
}
