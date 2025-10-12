import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	experimental: {
		serverActions: {
			bodySizeLimit: "30mb",
		},
	},
	webpack: (config, { isServer }) => {
		if (isServer) {
			config.externals = config.externals || [];
			config.externals.push({
				"@tensorflow/tfjs-node": "commonjs @tensorflow/tfjs-node",
			});
		}
		return config;
	},
};

export default nextConfig;
