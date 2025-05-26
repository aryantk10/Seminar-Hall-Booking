
import type {NextConfig} from 'next';
import type {Configuration as WebpackConfiguration} from 'webpack';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (
    config: WebpackConfiguration,
    { isServer }: { isServer: boolean }
  ) => {
    // Prevent Node.js specific modules from being bundled on the client
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          async_hooks: false,
          fs: false, // Add fallback for 'fs' module
          tls: false, // Add fallback for 'tls' module
        },
      };
    }
    return config;
  },
};

export default nextConfig;
