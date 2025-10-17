/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 's3.amazonaws.com', 'storage.googleapis.com'],
  },
}

module.exports = nextConfig