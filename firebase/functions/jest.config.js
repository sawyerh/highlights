module.exports = {
	preset: "ts-jest",
	setupFilesAfterEnv: ["<rootDir>/tests/_setup.ts"],
	testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/lib/"],
	transform: {
		"^.+\\.tsx?$": [
			"ts-jest",
			{
				isolatedModules: true,
			},
		],
	},
};
