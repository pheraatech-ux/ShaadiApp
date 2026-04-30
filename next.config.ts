import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack(config) {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".mjs": [".mjs", ".js"],
    };
    return config;
  },
};

export default nextConfig;
