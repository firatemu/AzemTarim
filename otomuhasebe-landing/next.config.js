/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker deployment
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: true,
  },
  // Optimize for production
  compress: true,
  swcMinify: true,
}

module.exports = nextConfig
