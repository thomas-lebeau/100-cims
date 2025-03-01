import { withVercelToolbar } from "@vercel/toolbar/plugins/next";

/** @type {import('next').NextConfig} */

const nextConfig = {
  productionBrowserSourceMaps: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default withVercelToolbar()(nextConfig);
