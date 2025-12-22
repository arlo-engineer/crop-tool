import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	serverExternalPackages: ["@tensorflow/tfjs-node"],
	experimental: {
		serverActions: {
			bodySizeLimit: "30mb",
		},
	},
	turbopack: {},
};

export default nextConfig;
