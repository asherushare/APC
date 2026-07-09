import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://apc-backend-wsyo.onrender.com/api/v1' 
        : 'http://localhost:4000/api/v1');
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
