module.exports = {
	clearMocks: true,
	preset: "ts-jest",
	setupFilesAfterEnv: ["<rootDir>/tests/_setup.ts"],
	testPathIgnorePatterns: ["<rootDir>/node_modules/"],
	transform: {
		"^.+\\.ts$": [
			"ts-jest",
			{
				isolatedModules: true,
			},
		],
	},
};
