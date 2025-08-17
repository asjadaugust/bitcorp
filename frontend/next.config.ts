import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  // Force port 3000 to prevent auto-port-selection
  env: {
    PORT: '3000',
  },
  // Add strict port enforcement
  experimental: {
    // Add any experimental features here if needed
  },
};

export default withNextIntl(nextConfig);
