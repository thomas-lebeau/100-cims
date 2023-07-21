/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.feec.cat',
      },
    ],
  },
};

module.exports = nextConfig;
