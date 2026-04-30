import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".mjs": [".mjs", ".js"],
    };
    return config;
  },
};

export default nextConfig;
