import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/games/landscape-game',
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
