import path from 'node:path';
import type { NextConfig } from 'next';

const useBasePath = process.env.NEXT_PUBLIC_VBT_USE_BASEPATH !== 'false';
const BASE_PATH = useBasePath ? process.env.NEXT_PUBLIC_VBT_BASE_PATH || '/VBT' : '';
const backend = process.env.BACKEND_URL || 'http://localhost:4000';
const apiPrefix = BASE_PATH || '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  basePath: BASE_PATH,
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      {
        source: `${apiPrefix}/api/v1/:path*`,
        destination: `${backend}/api/v1/:path*`,
        basePath: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;