// @ts-check

/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
module.exports = {
	plugins: [
		require("prettier-plugin-tailwindcss"),
		require("@ianvs/prettier-plugin-sort-imports"),
	],
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
