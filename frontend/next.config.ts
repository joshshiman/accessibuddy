import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // This will allow production builds to complete even with TypeScript errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
