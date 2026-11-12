import path from "node:path";
import type { NextConfig } from "next";

// Cache Components is left off on purpose: most pages read the login cookie,
// and the previous (dynamic-by-default) rendering model keeps that simple.
const nextConfig: NextConfig = {
  turbopack: {
    // Pin the project root. Otherwise a stray lockfile in a parent folder (e.g. ~)
    // makes Turbopack watch that whole folder and recompile in a loop.
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
