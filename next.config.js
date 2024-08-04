const withVercelToolbar = require("@vercel/toolbar/plugins/next")();

/** @type {import('next').NextConfig} */

const nextConfig = {
  productionBrowserSourceMaps: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = withVercelToolbar(nextConfig);
