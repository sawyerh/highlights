/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.tsx", "./src/**/*.ts"],
	theme: {
		extend: {
			aspectRatio: {
				cover: "5 / 8",
			},
			colors: {
				lightBg: "#f6f6f1",
			},
			fontFamily: {
				// var's are set via @next/font
				sans: ["var(--font-ibm-plex)", "sans-serif"],
				serif: ["var(--font-noto-serif)", "serif"],
			},
			gridTemplateColumns: {
				volumes: "repeat(auto-fill, minmax(160px, 1fr))",
			},
			maxWidth: {
				"cover-sm": "170px",
				cover: "200px",
			},
		},
	},
	plugins: [],
};
