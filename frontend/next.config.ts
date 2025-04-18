import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Below Two configs are added for production build
  output: "standalone",
  reactStrictMode: true,
  eslint: {
    // !! WARN !!: Dangerously allow production builds even if
    // your project has ESLint errors. Do this only temporarily.
    ignoreDuringBuilds: true, // <--- Add this
  },
};

export default nextConfig;