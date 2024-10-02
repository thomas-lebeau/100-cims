const withVercelToolbar = require("@vercel/toolbar/plugins/next")();

/** @type {import('next').NextConfig} */

const nextConfig = {
  productionBrowserSourceMaps: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = withVercelToolbar(nextConfig);
