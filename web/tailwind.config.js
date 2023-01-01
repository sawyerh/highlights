/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.tsx"],
	theme: {
		extend: {
			aspectRatio: {
				cover: "5 / 8",
			},
			fontFamily: {
				// var's are set via @next/font
				sans: ["var(--font-ibm-plex)", "sans-serif"],
				serif: ["var(--font-noto-serif)", "serif"],
			},
			gridTemplateColumns: {
				volumes: "repeat(auto-fill, minmax(150px, 1fr))",
			},
			maxWidth: {
				"cover-sm": "150px",
				cover: "200px",
			},
		},
	},
	plugins: [],
};
