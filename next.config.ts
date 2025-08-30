import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: process.env.NEXT_PUBLIC_BACKEND_HOSTNAME || 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_BACKEND_HOSTNAME || 'localhost',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
