import { withVercelToolbar } from "@vercel/toolbar/plugins/next";

const nextConfig = {
  productionBrowserSourceMaps: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default withVercelToolbar()(nextConfig);
