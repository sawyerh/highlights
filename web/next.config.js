module.exports = {
	experimental: { appDir: true },
	images: {
		formats: ["image/avif", "image/webp"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "storage.googleapis.com",
				pathname: "/sawyer-highlights.appspot.com/**",
			},
			{
				protocol: "http",
				hostname: "127.0.0.1",
			},
		],
		minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year, in seconds
	},
};
