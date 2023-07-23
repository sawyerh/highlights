const path = require("path");

module.exports = {
	root: true,
	extends: ["eslint:recommended", "prettier"],
	env: {
		es6: true,
		jest: true,
		node: true,
	},
	parserOptions: {
		ecmaVersion: 2018,
	},
	overrides: [
		{
			files: "web/**/*.+(ts|tsx)",
			extends: [
				"plugin:@next/next/recommended",
				"plugin:@tanstack/eslint-plugin-query/recommended",
			],
			plugins: ["react"],
			settings: {
				next: {
					rootDir: "web/",
				},
			},
			parserOptions: {
				project: path.resolve(__dirname, "web/tsconfig.json"),
				tsconfigRootDir: path.resolve(__dirname, "web"),
			},
			rules: {
				"react/jsx-sort-props": [
					"warn",
					{
						reservedFirst: true,
					},
				],
			},
		},
		{
			files: "firebase/**/*.+(ts|tsx)",
			parserOptions: {
				project: path.resolve(__dirname, "firebase/functions/tsconfig.json"),
				tsconfigRootDir: path.resolve(__dirname, "firebase/functions"),
			},
		},
		{
			files: "**/*.+(ts|tsx)",
			parser: "@typescript-eslint/parser",
			plugins: ["@typescript-eslint/eslint-plugin"],
			extends: [
				"plugin:@typescript-eslint/eslint-recommended", // removes redundant warnings between TS & ESLint
				"plugin:@typescript-eslint/recommended", // rules specific to typescript, e.g., writing interfaces
			],
		},
	],
};
