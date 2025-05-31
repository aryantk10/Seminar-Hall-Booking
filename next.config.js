/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Ensure API URL is available at build time
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://seminar-hall-booking-backend.onrender.com/api'
  },
  
  // Enable standalone output for better deployment
  output: 'standalone',
  
  // Optimize for production
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: ['localhost', 'seminar-hall-booking-backend.onrender.com'],
    unoptimized: true
  },
  
  // Headers for CORS if needed
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
