import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['192.168.100.102:3000'],
    },
  },

  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
      
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
