import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['mysql2'],
  async redirects() {
    return [
      {
        source: '/top-10-seo-agencies-in-pakistan',
        destination: '/blog/top-10-seo-agencies-in-pakistan',
        permanent: true,
      },
      {
        source: '/top-10-seo-agencies-pakistan',
        destination: '/blog/top-10-seo-agencies-in-pakistan',
        permanent: true,
      },
      {
        source: '/top-seo-agencies-in-pakistan',
        destination: '/blog/top-10-seo-agencies-in-pakistan',
        permanent: true,
      },
      {
        source: '/best-seo-agencies-in-pakistan',
        destination: '/blog/top-10-seo-agencies-in-pakistan',
        permanent: true,
      },
      {
        source: '/best-seo-companies-in-pakistan',
        destination: '/blog/top-10-seo-agencies-in-pakistan',
        permanent: true,
      },
      {
        source: '/best-digital-marketing-agencies-in-pakistan',
        destination: '/blog/best-digital-marketing-agencies-in-pakistan',
        permanent: true,
      },
      {
        source: '/top-digital-marketing-agencies-in-pakistan',
        destination: '/blog/best-digital-marketing-agencies-in-pakistan',
        permanent: true,
      },
      {
        source: '/guest-posting-sites-list',
        destination: '/blog/high-da-guest-posting-sites-list-guide',
        permanent: true,
      },
      {
        source: '/high-da-guest-posting-sites',
        destination: '/blog/high-da-guest-posting-sites-list-guide',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
