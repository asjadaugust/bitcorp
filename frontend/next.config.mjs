import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  /* config options here */
  // Force port 3000 to prevent auto-port-selection
  env: {
    PORT: '3000',
  },

  // Enable standalone output for production Docker builds
  output: 'standalone',

  // Add strict port enforcement
  experimental: {
    // Add any experimental features here if needed
  },
};

export default withNextIntl(nextConfig);
