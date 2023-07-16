module.exports = {
	plugins: [require("prettier-plugin-tailwindcss")],
	trailingComma: "all",
	useTabs: true,
	importOrder: [
		"<BUILTIN_MODULES>",
		"",
		"^firebase",
		"^@google-cloud",
		"^aws",
		"^@?next",
		"",
		"<THIRD_PARTY_MODULES>",
		"",
		"^[./]",
	],
	importOrderTypeScriptVersion: "4.9.0",
};
