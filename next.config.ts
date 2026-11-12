import type { NextConfig } from "next";

// Cache Components is left off on purpose: most pages read the login cookie,
// and the previous (dynamic-by-default) rendering model keeps that simple.
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
