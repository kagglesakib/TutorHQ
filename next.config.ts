import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
    ];
  },
};

export default nextConfig;

