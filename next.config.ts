import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@supabase/supabase-js',
      '@hookform/resolvers',
      'date-fns',
      'react-hook-form',
      'sonner',
      'zod'
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
};

export default nextConfig;
