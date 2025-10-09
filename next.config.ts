import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		serverActions: {
			bodySizeLimit: "4mb",
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
