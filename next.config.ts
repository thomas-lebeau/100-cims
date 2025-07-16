import { withVercelToolbar } from "@vercel/toolbar/plugins/next";
import { datadogWebpackPlugin } from "@datadog/webpack-plugin";

const nextConfig = {
  productionBrowserSourceMaps: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // @ts-expect-error I don't know where this defined and I do not care
  webpack: (config) => {
    // Add custom Webpack configuration here
    config.plugins.unshift(
      datadogWebpackPlugin({
        rum: {
          privacy: {
            disabled: false,
          },
        },
      })
    );

    // Return the modified config
    return config;
  },
};

export default withVercelToolbar()(nextConfig);
