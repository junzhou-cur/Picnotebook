/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5003',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5003/api/:path*',
      },
      {
        source: '/auth/:path*',
        destination: 'http://localhost:5003/auth/:path*',
      },
    ];
  },
  images: {
    domains: ['localhost', '10.67.36.36', '141.214.17.120', 'picnotebook.com'],
  },
}

module.exports = nextConfig