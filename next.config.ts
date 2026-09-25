import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  productionBrowserSourceMaps: false,
  typescript: {
    // Speeds up Next.js build; TypeScript validity is strictly checked via `npm run lint` (tsc --noEmit)
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Radically speeds up compilation by tree-shaking barrel imports for large libraries
    optimizePackageImports: ['lucide-react', 'recharts', 'motion'],
  },
  async redirects() {
    return [
      {
        source: '/students',
        destination: '/admin/students',
        permanent: false,
      },
      {
        source: '/tracking',
        destination: '/admin/tracking',
        permanent: false,
      },
      {
        source: '/exams',
        destination: '/admin/exams',
        permanent: false,
      },
      {
        source: '/payments',
        destination: '/admin/payments',
        permanent: false,
      },
      {
        source: '/approvals',
        destination: '/admin/approvals',
        permanent: false,
      },
      {
        source: '/backup',
        destination: '/admin/backup',
        permanent: false,
      },
      {
        source: '/profile',
        destination: '/admin/profile',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

