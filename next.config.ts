import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3004',
      },
    ],
  },
  // Allow importing from server/src/types for shared types
  transpilePackages: [],
};

export default nextConfig;
