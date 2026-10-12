import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page in this app is per-user (session cookie), so we use classic dynamic rendering
  // instead of Cache Components.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    serverActions: { bodySizeLimit: "50mb" },
  },
};

export default nextConfig;
