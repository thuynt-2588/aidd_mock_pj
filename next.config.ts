import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  // Playwright opens the app at 127.0.0.1 (cookies are set for that host). A dev
  // server started without `-H 127.0.0.1` only trusts localhost, blocks the dev
  // scripts for 127.0.0.1, and the page never hydrates (every click is a no-op).
  allowedDevOrigins: ["127.0.0.1"],
  // Sun* Kudos avatars are the users' Google (Gmail) profile pictures.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" }],
  },
  partialPrefetching: true,
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
