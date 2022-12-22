import { IBM_Plex_Mono, Noto_Serif } from "@next/font/google";

import "globals.css";

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

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<meta content="width=device-width, initial-scale=1" name="viewport" />
				<link rel="SHORTCUT ICON" href="/favicon.png" />
			</head>
			<body className={`${fontSerif.variable} ${fontSans.variable} font-sans`}>
				{children}
			</body>
		</html>
	);
}